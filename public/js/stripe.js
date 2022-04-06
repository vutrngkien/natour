/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51KlDwjLQx2naAgTNP9rhjHxYeOQILa2ACzAlTVlQJiBPhJ1MHBCYcEEeqi1Rlgx5E9Y04Ly1pxqhDLs2m2oyDEXH00M5QGTYpJ'
  );
  try {
    // 1 get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    );

    // 2 create checkout form
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
