import React from "react";
import { Card, Col, Row, Spinner } from "react-bootstrap";
import { FaChartLine, FaShoppingBag, FaStore, FaUsers } from "react-icons/fa";
import "../../assets/Css/Homedashboard.css";

const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
});

const formatNumber = (value) => numberFormatter.format(Number(value) || 0);
const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const Trend = ({ value, unavailableLabel }) => {
    if (value === undefined || value === null) {
        return <span className="metric-context">{unavailableLabel}</span>;
    }

    const numericValue = Number(value) || 0;
    const direction = numericValue > 0 ? "up" : numericValue < 0 ? "down" : "neutral";
    const copy = numericValue > 0 ? "up" : numericValue < 0 ? "down" : "no change";

    return (
        <span className={`metric-trend ${direction}`}>
            {Math.abs(numericValue).toFixed(1)}% {copy} from yesterday
        </span>
    );
};

const SummaryCards = ({ data, loading }) => {
    const metrics = [
        {
            label: "Total revenue",
            value: formatCurrency(data?.revenue_and_profit?.total_revenue),
            icon: FaChartLine,
            tone: "orange",
            trend: data?.revenue_and_profit?.revenue_change_percentage,
        },
        {
            label: "Orders",
            value: formatNumber(data?.order_statistics?.total_orders),
            icon: FaShoppingBag,
            tone: "blue",
            trend: data?.order_statistics?.order_change_percentage,
        },
        {
            label: "Active customers",
            value: formatNumber(data?.user_statistics?.active_customers),
            icon: FaUsers,
            tone: "green",
            context: "Active customer accounts",
        },
        {
            label: "Active vendors",
            value: formatNumber(data?.user_statistics?.active_vendors),
            icon: FaStore,
            tone: "violet",
            context: "Approved vendor accounts",
        },
    ];

    return (
        <Row className="g-3 dashboard-metrics">
            {metrics.map(({ label, value, icon: Icon, tone, trend, context }) => (
                <Col xs={12} sm={6} xl={3} key={label}>
                    <Card className="dashboard-metric-card h-100">
                        <Card.Body>
                            <div className="metric-card-topline">
                                <span>{label}</span>
                                <div className={`metric-icon ${tone}`}>
                                    <Icon aria-hidden="true" />
                                </div>
                            </div>
                            <strong className="metric-value">
                                {loading ? <Spinner animation="border" size="sm" /> : value}
                            </strong>
                            <Trend value={trend} unavailableLabel={context} />
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default SummaryCards;
