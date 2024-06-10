 # Hotel Booking System

## Project Overview

This project implements a hotel booking system similar to Hotels.com. It allows users to search for hotels, book rooms, and receive notifications. The system includes the following services:
- Admin Service
- Search Service
- Booking Service
- Notification Service
- API Gateway

## Functional Requirements

### Hotel Admin Service

Admins can add or update room availability for specified dates. This service requires authentication.

#### Endpoints:
- `POST v1/admin/add-room`: Add or update room details.

### Hotel Search Service

Users can search for hotels by destination, dates, and number of people. Logged-in users will see discounted prices, and the search results can be displayed on a map.

#### Endpoints:
- `GET v1/search`: Search for hotels based on destination, dates, and number of people.

### Book Hotel Service

Users can book a hotel from the hotel detail page. The hotel's capacity is decreased for the specified dates upon booking.

#### Endpoints:
- `POST v1/book`: Book a hotel room.

### Notification Service

A nightly scheduled task checks hotel capacities and notifies administrators if the capacity is below 20% for the next month. It also sends reservation details for new bookings from the queue.

#### Endpoints:
- `GET v1/notify`: Send notifications based on hotel capacities.

## Non-Functional Requirements

- All services are RESTful and versioned.
- Pagination is supported where necessary.
- The system uses RabbitMQ for messaging.
- Redis is used for caching.
- The system is containerized using Docker and deployable to cloud platforms like AWS, Azure, or Google Cloud.

# Access the services via the following URLs:
 -API Gateway: http://localhost:3000
 -Admin Service: http://localhost:3001
 -Search Service: http://localhost:3002
 -Booking Service: http://localhost:3003
 -Notification Service: http://localhost:3004
 -Authentication Service: http://localhost:3005

![image](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/3e7e1917-4f13-4f1b-9afb-716eef2a6d54)

![image](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/1438364b-26ea-430d-ab44-b5cc542ccd09)

![image](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/734b421f-7823-4a5d-9301-8e2935d5fbdb)

![image](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/5b5fbc73-c83e-4d1b-a239-1d5c6a86fd28)

![image](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/c0bd27aa-4f98-4a06-9143-a9ef316cf9f5)

![image](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/b07be091-d0bd-4d73-ab5c-01cbd001071d)

![Ekran görüntüsü 2024-06-10 221042](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/469d96e3-3d3d-4b15-8e72-b495fa9198bd)

![Ekran görüntüsü 2024-06-10 221058](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/d123bc51-7467-4b37-957b-8103f8a6c2eb) 
.....
# Data Models
![hotel_booking_system_](https://github.com/OzlemKlc/hotel_booking_system_se_4458/assets/122043812/00de0e99-b722-47d4-a4ca-e5cb06133e6e)
