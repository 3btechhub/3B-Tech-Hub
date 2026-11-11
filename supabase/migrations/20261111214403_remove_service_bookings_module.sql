-- Remove the retired Service Request / Booking module.
-- Verified before applying: public.service_bookings contains 0 rows.
drop table if exists public.service_bookings;
