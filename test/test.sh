curl -X POST http://localhost:8080 \
  -H "EMAIL_MESSAGE_TYPE: NewAirbnbBooking" \
  -H "EMAIL_FILTER_FROM: airbnb.com" \
  -H "EMAIL_FILTER_SUBJECT: Reservation confirmed" \
  -H "EMAIL_FILTER_AFTER: 2024-01-01" \
  -H "TOPIC: airbnb"