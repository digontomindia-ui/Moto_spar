# utils.py

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from datetime import datetime


# ! Notify admin about product request
def notify_vendor_about_order_assignment(vendor, order_item):
    subject = "Product Assigned to You - MotoSpar"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [vendor.email]  # Send email to the vendor

    # Render the email content using the HTML template
    html_content = render_to_string('vendor_order_assignment_notification_email.html', {
        'vendor_name': vendor.get_full_name(),  # Assuming the vendor has a method to get full name
        'order_item_details': order_item,
        'vendor_selling_price': order_item.vendor_selling_price,
        'order_item_id': order_item.id,
        'created_at': order_item.created_at.strftime('%Y-%m-%d %H:%M:%S'),  # Assuming there's a created_at field
        'current_year': datetime.now().year,  # Add current year
    })
    text_content = strip_tags(html_content)

    # Create the email message
    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    try:
        msg.send(fail_silently=False)
    except Exception as e:
        print(f"Error notifying vendor about order assignment: {e}")



# ! Generate Invoice PDF (ReportLab)
def generate_invoice_pdf_reportlab(order):
    from io import BytesIO
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
    from reportlab.lib.units import inch
    from .models import OrderItem
    from decimal import Decimal
    import os

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
    elements = []
    styles = getSampleStyleSheet()

    # --- Header ---
    # Logo
    logo_path = os.path.join(settings.BASE_DIR, 'Logo 3.png') 
    
    # Header Layout: Logo (Left) | Title (Right)
    if os.path.exists(logo_path):
        # Instead of manual calculation, use ReportLab's built in getKeepAspect
        img = Image(logo_path, width=1.5*inch, height=0.8*inch, kind='proportional')
        img.hAlign = 'LEFT'
        img.hAlign = 'LEFT'
        logo_cell = [img] # Pass as list to Table cell
    else:
        logo_cell = [Paragraph("<b>Motospar</b>", styles["Heading2"])]

    title_style = ParagraphStyle(name='InvoiceTitle', parent=styles['Heading2'], alignment=TA_RIGHT, fontSize=16)
    title_cell = Paragraph("Tax Invoice/Bill of Supply/Cash Memo<br/><font size=10>(Original for Recipient)</font>", title_style)
    
    header_table = Table([[logo_cell, title_cell]], colWidths=[3*inch, 4*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 20))

    # --- Company & Order Info ---
    # Left: Sold By (Motospar) | Right: Billing/Shipping
    
    # Define Styles
    normal_style = styles["Normal"]
    bold_style = ParagraphStyle(name='Bold', parent=normal_style, fontName='Helvetica-Bold')
    right_style = ParagraphStyle(name='Right', parent=normal_style, alignment=TA_RIGHT)
    
    items = OrderItem.objects.filter(order=order).exclude(order_status='CANCELLED')
    
    # Process Vendor Info
    vendor_store_name = "Motospar"
    vendor_address = "Agra, Uttar Pradesh<br/>India"
    
    first_vendor_item = items.filter(assigned_vendor__isnull=False).first()
    if first_vendor_item:
        vendor_user = first_vendor_item.assigned_vendor
        if hasattr(vendor_user, 'vendor_profile'):
            profile = vendor_user.vendor_profile
            vendor_store_name = profile.store_name or vendor_user.get_full_name() or vendor_user.username
            
            # Build address string
            addr_parts = [profile.store_address, profile.store_city, profile.store_state]
            addr_base = ", ".join(filter(None, addr_parts))
            postal = f" - {profile.store_postal_code}" if profile.store_postal_code else ""
            vendor_address = f"{addr_base}{postal}<br/>{profile.store_country}"
        else:
            vendor_store_name = vendor_user.get_full_name() or vendor_user.username
            
    # Sold By Address
    sold_by_text = f"""<b>Sold By:</b><br/>
    {vendor_store_name}<br/>
    {vendor_address}<br/>
    """
    sold_by_p = Paragraph(sold_by_text, normal_style)

    # Addresses (Make billing same as shipping)
    shipping_address = order.shipping_address
    billing_address = order.shipping_address # Requested: Billing same as shipping
    
    # format address helper
    def format_addr(addr):
        if not addr: return ""
        return f"{addr.street_address}<br/>{addr.city}, {addr.state} - {addr.postal_code}<br/>{addr.country}"

    address_text = f"""<b>Billing Address:</b><br/>
    {order.customer.get_full_name()}<br/>
    {format_addr(billing_address)}<br/>
    <br/>
    <b>Shipping Address:</b><br/>
    {order.customer.get_full_name()}<br/>
    {format_addr(shipping_address)}
    """
    address_p = Paragraph(address_text, right_style)

    # Align Sold By (Left) with Address (Right)
    info_table = Table([[sold_by_p, address_p]], colWidths=[3.5*inch, 3.5*inch])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (0,0), (0,0), 'LEFT'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 15))

    # Order Details (Split left/right)
    order_info_left = f"""
    <b>Order Number:</b> {order.order_code}<br/>
    <b>Order Date:</b> {order.created_at.strftime('%d.%m.%Y')}<br/>
    """
    order_info_right = f"""
    <b>Invoice Number:</b> INV-{order.order_code}<br/>
    <b>Invoice Date:</b> {datetime.now().strftime('%d.%m.%Y')}
    """
    
    order_p_left = Paragraph(order_info_left, normal_style)
    order_p_right = Paragraph(order_info_right, right_style)
    
    order_table = Table([[order_p_left, order_p_right]], colWidths=[3.5*inch, 3.5*inch])
    order_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ALIGN', (0,0), (0,0), 'LEFT'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    
    elements.append(order_table)
    elements.append(Spacer(1, 15))

    # --- Items Table ---
    # Columns: SI No, Description, Unit Price, Qty, Net Amount, Tax Rate, SGST, CGST, Total Tax, Total Amount
    data = [['Sl', 'Description', 'Unit Price', 'Qty', 'Net', 'Tax%', 'SGST', 'CGST', 'Tax', 'Total']]
    
    total_net = Decimal('0.00')
    total_tax_val = Decimal('0.00')
    grand_total = Decimal('0.00')
    
    for idx, item in enumerate(items, 1):
        variant = item.variant
        quantity = item.quantity
        unit_price = variant.price_excluding_gst
        tax_rate = variant.product.gst_rate if variant.product.is_gst_applicable else 0
        sgst = variant.sgst * quantity
        cgst = variant.cgst * quantity
        line_tax = sgst + cgst
        net = unit_price * quantity
        line_total = net + line_tax
        
        # Formatting
        desc = Paragraph(f"{variant.product.name}", normal_style)
        
        data.append([
            str(idx),
            desc,
            f"{unit_price:.2f}",
            str(quantity),
            f"{net:.2f}",
            f"{tax_rate}%",
            f"{sgst:.2f}",
            f"{cgst:.2f}",
            f"{line_tax:.2f}",
            f"{line_total:.2f}"
        ])
        
        total_net += net
        total_tax_val += line_tax
        grand_total += line_total

    # Totals Row
    data.append(['', 'Total', '', '', f"{total_net:.2f}", '', '', '', f"{total_tax_val:.2f}", f"{grand_total:.2f}"])

    # Table Style
    table = Table(data, colWidths=[0.4*inch, 2.0*inch, 0.7*inch, 0.4*inch, 0.7*inch, 0.5*inch, 0.6*inch, 0.6*inch, 0.6*inch, 0.8*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.black),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('ALIGN', (1,0), (1,-1), 'LEFT'), # Description align left
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'), # Total row bold
    ]))
    elements.append(table)
    elements.append(Spacer(1, 20))

    # --- Footer ---
    try:
        from num2words import num2words
        amount_words = num2words(grand_total, lang='en_IN').title()
        amount_in_words = f"Amount in Words: {amount_words} Rupees Only"
    except ImportError:
        amount_in_words = f"Amount in Words: {grand_total:.2f} Rupees Only"
        
    elements.append(Paragraph(f"<b>{amount_in_words}</b>", normal_style))
    elements.append(Spacer(1, 30))
    
    sign_data = [
        ['', Paragraph(f"<b>For {vendor_store_name}</b>", right_style)],
        ['', ''], # spacer rows for signature
        ['', ''],
        ['', ''],
        ['', Paragraph("Authorized Signatory", right_style)]
    ]
    sign_table = Table(sign_data, colWidths=[4*inch, 3*inch])
    sign_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    elements.append(sign_table)

    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf

# ! Send Invoice Email
def send_invoice_email(order):
    """
    Generates invoice PDF and sends it to the customer.
    """
    subject = f"Invoice for Order #{order.order_code} - Motospar"
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [order.customer.email]

    text_content = f"Dear {order.customer.get_full_name()},\n\nPlease find attached the invoice for your order #{order.order_code}.\n\nThank you for shopping with Motospar!"
    html_content = f"<p>Dear {order.customer.get_full_name()},</p><p>Please find attached the invoice for your order <strong>#{order.order_code}</strong>.</p><p>Thank you for shopping with Motospar!</p>"

    msg = EmailMultiAlternatives(subject, text_content, from_email, recipient_list)
    msg.attach_alternative(html_content, "text/html")

    # Generate PDF (Using ReportLab)
    pdf_content = generate_invoice_pdf_reportlab(order)
    
    if pdf_content:
        filename = f"Invoice_{order.order_code}.pdf"
        msg.attach(filename, pdf_content, 'application/pdf')
        
        try:
            msg.send(fail_silently=False)
            return True
        except Exception as e:
            print(f"Error sending invoice email: {e}")
            return False
    else:
        print("Failed to generate PDF invoice")
        return False
