import React from 'react';
import { View, Text } from 'react-native';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StarRating = ({ rating, iconsize,israting}) => {
    const fullStars = Math.floor(rating); // Number of full stars
    const hasHalfStar = rating % 1 !== 0; // True if there's any decimal part
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining empty stars
  
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between' }}>
        {/* Full Stars */}
        <View style={{ flexDirection: 'row', alignItems: 'center',gap:4 }}>
        {[...Array(fullStars)].map((_, index) => (
          <Ionicons key={`full-${index}`} name="star" size={responsiveFontSize(iconsize)} color="gold" />
        ))}
  
        {/* Half Star */}
        {hasHalfStar && <Ionicons name="star-half" size={responsiveFontSize(iconsize)} color="gold" />}
  
        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, index) => (
          <Ionicons key={`empty-${index}`} name="star-outline" size={responsiveFontSize(iconsize)} color="gold" />
        ))}
        </View>
  
        {/* Rating Text */}
      { israting?
       rating===0?
       null:
       <Text style={{ marginLeft: 5, color:'black',fontSize:10}}>{rating.toFixed(0)}/5</Text>
        :
        null
      }
      </View>
    );
  };
  export default StarRating;