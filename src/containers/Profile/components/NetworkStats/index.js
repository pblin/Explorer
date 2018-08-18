import React from 'react';
import styles from './NetworkStats.module.scss';
import { Circle, Switch, Text } from 'components';
import { map as fpMap, capitalize } from 'lodash';
import { descriptionText, displayFormat, statsToShow } from './constants';
import { profileUISelector } from 'containers/Profile/selectors';
import { reviewsStateSelector } from 'public-modules/Reviews/selectors';
import { actions as reviewsActions } from 'public-modules/Reviews';

const map = fpMap.convert({ cap: false });

function formatInput(value, format) {
  if (format === 'fraction') {
    return `${Number(value.toFixed(0))}/5`;
  } else {
    return `${Number(value * 100).toFixed(0)}%`;
  }
}

const NetworkStats = props => {
  const { stats, switchValue, toggleNetworkSwitch } = props;

  const renderCircle = key => {
    const text = descriptionText[switchValue][key];
    let value = stats[switchValue][key];
    let color = value >= 0.8 ? 'green' : value >= 0.5 ? 'orange' : 'red';

    if (value > 1) {
      color = value >= 4 ? 'green' : value >= 3 ? 'orange' : 'red';
    }

    let input = formatInput(value, displayFormat[key]);

    if (value == null) {
      color = 'lightGrey';
    }

    return (
      <div className={styles.networkStatCircle}>
        <Circle
          type="text"
          size="medium"
          input={input}
          color={color}
          textColor="white"
        />
        {key === 'rating' ? (
          <Text
            onClick={() => setReviewsModalVisible(true)}
            typeScale="Small"
            alignment="align-center"
            color="defaultGrey"
            className={styles.reviewsModalLink}
          >
            {text}
          </Text>
        ) : (
          <Text typeScale="Small" alignment="align-center" color="defaultGrey">
            {text}
          </Text>
        )}
      </div>
    );
  };

  return (
    <div className={styles.network}>
      <ReviewsModal
        visible={reviewsModalVisible}
        onClose={() => setReviewsModalVisible(false)}
        reviewType={switchValue.charAt(0).toUpperCase() + switchValue.slice(1)}
        reviews={reviews}
        count={count}
        loadMore={loadMoreReviews}
        loadingMore={loadingMore}
        loadingMoreError={loadingMoreError}
      />
      <div className={styles.networkStatsHeader}>
        <Text typeScale="h3" color="black">
          Network Stats
        </Text>

        <Switch
          onValue={'Fulfiller'}
          offValue={'Issuer'}
          value={capitalize(switchValue)}
          onChange={toggleNetworkSwitch}
        />
      </div>

      <div className={styles.networkStatsContainer}>
        {renderCircle('acceptance')}
        {renderCircle('rating')}
        {renderCircle('ratingGiven')}
      </div>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const reviewsState = reviewsStateSelector(state);
  const profileUI = profileUISelector(state);

  return {
    reviewsState,
    reviewsModalVisible: profileUI.reviewsModalVisible,
    reviewsLoaderInitialProps: {
      address: ownProps.address,
      reviewType: ownProps.switchValue
    }
  };
};

const NetworkStats = compose(
  connect(
    mapStateToProps,
    {
      load: reviewsActions.loadReviewsReceived,
      loadMoreReviews: reviewsActions.loadMoreReviews
    }
  ),
  LoadComponent('reviewsLoaderInitialProps')
)(NetworkStatsComponent);

export default NetworkStats;
