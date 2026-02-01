INSERT INTO locations (StreetAddress, city, province, postalCode) VALUES
('123 Elm St', 'Toronto', 'Ontario', 'M5G 2K4'),
('456 Maple Ave', 'Vancouver', 'British Columbia', 'V5K 0A1'),
('789 Birch Pl', 'Calgary', 'Alberta', 'T2P 5H1'),
('101 Pine Rd', 'Montreal', 'Quebec', 'H3C 2A1'),
('202 Oak Cir', 'Ottawa', 'Ontario', 'K1P 1J1'),
('303 Willow Way', 'Edmonton', 'Alberta', 'T5J 2Z3'),
('404 Cedar Ln', 'Winnipeg', 'Manitoba', 'R3C 0V6'),
('505 Aspen Blvd', 'Halifax', 'Nova Scotia', 'B3J 3P7'),
('606 Fir St', 'Saskatoon', 'Saskatchewan', 'S7K 2L3'),
('707 Spruce Ave', 'Regina', 'Saskatchewan', 'S4P 3Y2'),
('808 Cherry Cres', 'Victoria', 'British Columbia', 'V8W 1T3'),
('909 Alder Rd', 'Hamilton', 'Ontario', 'L8P 1A1'),
('1010 Poplar St', 'Mississauga', 'Ontario', 'L5B 2T8'),
('1111 Chestnut Ct', 'Quebec City', 'Quebec', 'G1R 2H5'),
('1212 Beech Dr', 'Sherbrooke', 'Quebec', 'J1H 5H9'),
('1313 Elmwood St', 'London', 'Ontario', 'N6A 1C5'),
('1414 Pinehurst Ln', 'Brampton', 'Ontario', 'L6Y 4W3'),
('1515 Oakmount Rd', 'Surrey', 'British Columbia', 'V3T 1B7'),
('1616 Birchwood Ter', 'Kelowna', 'British Columbia', 'V1Y 6Z4'),
('1717 Cedar Park Pl', 'Fredericton', 'New Brunswick', 'E3B 1H4');

INSERT INTO users (email, password, active, signUpDate, isBusiness, userImage, user_phone_number, user_address) VALUES
('alex.smith@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '123-456-7890', 1),
('jessica.johnson@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '234-567-8901', 2),
('michael.williams@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '345-678-9012', 3),
('emily.brown@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '456-789-0123', 4),
('matthew.jones@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '567-890-1234', 5),
('ashley.garcia@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '678-901-2345', 6),
('joshua.miller@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '789-012-3456', 7),
('sophia.davis@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '890-123-4567', 8),
('christopher.rodriguez@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '901-234-5678', 1),
('isabella.martinez@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '012-345-6789', 9),
('andrew.hernandez@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '987-654-3210', 10),
('samantha.lopez@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '876-543-2109', 11),
('joseph.gonzalez@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '765-432-1098', 12),
('olivia.wilson@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '654-321-0987', 13),
('david.anderson@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '543-210-9876', 14),
('emma.thomas@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '432-109-8765', 15),
('daniel.taylor@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '321-098-7654', 16),
('ava.moore@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '210-987-6543', 17),
('john.jackson@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '109-876-5432', 18),
('mia.lee@email.com', 'password123', true, CURRENT_TIMESTAMP, false, NULL, '098-765-4321', 19);

INSERT INTO workers (user_id, first_name, last_name, biography, desired_work_radius, desired_pay) VALUES
(1, 'Alex', 'Smith', 'Experienced carpenter with over 10 years of experience.', 10, 25.00),
(2, 'Jessica', 'Johnson', 'Certified electrician specializing in residential wiring.', 15, 30.00),
(3, 'Michael', 'Williams', 'Skilled plumber available for residential and commercial projects.', 20, 28.00),
(4, 'Emily', 'Brown', 'Experienced HVAC technician specializing in residential installations and repairs.', 25, 35.00),
(5, 'Matthew', 'Jones', 'Skilled landscaper with expertise in lawn maintenance and garden design.', 30, 20.00),
(6, 'Ashley', 'Garcia', 'Certified IT technician offering troubleshooting and network setup services.', 20, 40.00);

INSERT INTO businesses (user_id, business_name, business_description, business_email, business_website) VALUES
(1, 'Event Pro Coordinators', 'Expertise in organizing and managing conferences and corporate events.', 'contact@eventpro.com', 'www.eventpro.com'),
(2, 'Welcome Inn Services', 'A leading hospitality service with a focus on front desk management.', 'info@welcomeinn.com', 'www.welcomeinn.com'),
(3, 'Market Square Retail', 'Providing top-notch retail assistance and customer service.', 'sales@marketsquareretail.com', 'www.marketsquareretail.com'),
(4, 'QuickShip Couriers', 'Specializing in efficient, reliable package and document delivery services.', 'dispatch@quickship.com', 'www.quickship.com'),
(5, 'MaintainX Solutions', 'Your go-to for building maintenance and emergency repair services.', 'service@maintainxsolutions.com', 'www.maintainxsolutions.com'),
(6, 'ShopPersonal', 'Offering personalized shopping services tailored to each clients needs.', 'help@shoppersonal.com', 'www.shoppersonal.com'),
(7, 'Renovate Right', 'Assisting with high-quality home renovation projects to bring your vision to life.', 'projects@renovateright.com', 'www.renovateright.com'),
(8, 'CareAssist Health Services', 'Providing compassionate and competent care as nursing assistants.', 'care@careassist.com', 'www.careassist.com'),
(9, 'SafeRide Transport', 'Safe and timely shuttle services for all your transportation needs.', 'rides@saferide.com', 'www.saferide.com'),
(10, 'TechHelp Solutions', 'Offering comprehensive IT support and troubleshooting services.', 'support@techhelp.com', 'www.techhelp.com'),
(11, 'Crystal Clear Cleaning', 'Ensuring high-standard cleanliness and order in various settings.', 'clean@crystalclear.com', 'www.crystalclear.com'),
(12, 'FitLife Trainers', 'Individualized fitness programs designed by professional personal trainers.', 'train@fitlife.com', 'www.fitlife.com'),
(13, 'Moments Captured Photography', 'Specializing in capturing the essence of your special moments.', 'photos@momentscaptured.com', 'www.momentscaptured.com'),
(14, 'Creative Minds Design', 'Creating visual concepts that inspire, inform, and captivate consumers.', 'design@creativeminds.com', 'www.creativeminds.com'),
(15, 'History Alive Tours', 'Engaging and informative tours bringing museum exhibits to life.', 'tours@historyalive.com', 'www.historyalive.com'),
(16, 'AutoWorks Assistance', 'Helping with vehicle repairs and maintenance for top-quality service.', 'service@autoworks.com', 'www.autoworks.com'),
(17, 'Gadget Galaxy', 'The one-stop shop for all your electronics and gadget needs.', 'contact@gadgetgalaxy.com', 'www.gadgetgalaxy.com'),
(18, 'Fresh Farm Market', 'Bringing you the freshest locally sourced produce and organic goods.', 'info@freshfarmmarket.com','www.freshfarmmarket.com'),
(19, 'Urban Movers', 'Reliable and efficient moving services to make your relocation smooth and stress-free.', 'move@urbanmovers.com', 'www.urbanmovers.com'),
(20, 'Creative Content Creators', 'Providing top-tier content creation and digital marketing services.', 'content@creativecontentcreators.com', 'www.creativecontentcreators.com');

INSERT INTO jobPostings (jobTitle, jobType, jobDescription, hourlyRate, jobStart, jobEnd, jobfilled, location_id, user_id) VALUES
('Conference Coordinator', 'Event Staffing', 'Organize and manage all aspects of conference production from planning to execution.', 25.00, '2023-05-15 09:00:00', '2023-05-16 17:00:00', FALSE, 1, 1),
('Hotel Front Desk Manager', 'Hospitality Services', 'Manage front desk operations, ensuring guest satisfaction and smooth operation.', 20.00, '2023-06-01 08:00:00', '2023-12-01 20:00:00', FALSE, 2, 2),
('Retail Sales Associate', 'Retail Assistance', 'Assist customers, manage inventory, and ensure a positive shopping experience.', 15.00, '2023-07-01 10:00:00', '2023-07-31 18:00:00', FALSE, 3, 3),
('Courier Service Provider', 'Delivery Services', 'Deliver packages and documents efficiently, ensuring timely deliveries.', 18.00, '2023-08-01 09:00:00', '2023-08-30 17:00:00', FALSE, 4, 4),
('Building Maintenance Technician', 'Maintenance and Repair', 'Perform routine building maintenance tasks and emergency repairs.', 22.00, '2023-09-01 08:00:00', '2023-09-30 16:00:00', FALSE, 5, 5),
('Personal Shopper', 'Personal Services', 'Provide personalized shopping services to clients based on their preferences and needs.', 20.00, '2023-10-01 10:00:00', '2023-10-31 18:00:00', FALSE, 6, 6),
('Home Renovation Assistant', 'Construction and Renovation', 'Assist in various home renovation projects, ensuring quality and efficiency.', 25.00, '2023-11-01 09:00:00', '2023-11-30 17:00:00', FALSE, 7, 7),
('Nursing Assistant', 'Healthcare Assistance', 'Provide basic patient care under the direction of nursing staff.', 22.00, '2023-12-01 08:00:00', '2023-12-31 16:00:00', FALSE, 8, 8),
('Shuttle Driver', 'Transportation Services', 'Operate a shuttle service for guests, ensuring safe and timely transportation.', 18.00, '2024-01-01 06:00:00', '2024-01-31 18:00:00', FALSE, 9, 9),
('IT Support Technician', 'Technical Support', 'Provide technical support and troubleshooting services to end-users.', 30.00, '2024-02-01 09:00:00', '2024-02-28 17:00:00', FALSE, 10, 10),
('Housekeeping Staff', 'Cleaning Services', 'Maintain cleanliness and order in various settings, ensuring high standards are met.', 16.00, '2024-03-01 08:00:00', '2024-03-31 16:00:00', FALSE, 11, 11),
('Personal Fitness Trainer', 'Fitness Instruction', 'Design and implement individualized fitness programs for clients.', 35.00, '2024-04-01 06:00:00', '2024-04-30 20:00:00', FALSE, 12, 12),
('Wedding Photographer', 'Photography and Videography', 'Capture the essence of weddings through photography and videography.', 40.00, '2024-05-01 10:00:00', '2024-05-31 18:00:00', FALSE, 13, 13),
('Graphic Designer', 'Creative Services', 'Create visual concepts to communicate ideas that inspire and inform consumers.', 28.00, '2024-06-01 09:00:00', '2024-06-30 17:00:00', FALSE, 14, 14),
('Museum Guide', 'Hospitality Services', 'Provide informative tours of museum exhibits, ensuring a rich visitor experience.', 18.00, '2024-07-01 10:00:00', '2024-07-31 17:00:00', FALSE, 15, 15),
('Auto Mechanic Helper', 'Maintenance and Repair', 'Assist in vehicle repairs and maintenance, ensuring high-quality service.', 20.00, '2024-08-01 09:00:00', '2024-08-30 18:00:00', FALSE, 16, 16),
('Tech Support Assistant', 'Technical Support', 'Provide assistance in resolving technical issues for consumers and businesses.', 22.00, '2024-09-01 08:00:00', '2024-09-30 17:00:00', FALSE, 17, 17),
('Landscaper', 'Personal Services', 'Design and maintain outdoor spaces, ensuring aesthetic and functional outdoor environments.', 21.00, '2024-10-01 08:00:00', '2024-10-31 16:00:00', FALSE, 18, 18),
('Airport Shuttle Driver', 'Transportation Services', 'Ensure timely and safe transportation of passengers between terminals and parking facilities.', 19.00, '2024-11-01 05:00:00', '2024-11-30 23:00:00', FALSE, 19, 19),
('Bar Manager', 'Hospitality', 'Oversee bar operations, manage staff, and ensure customer satisfaction.', 30.00, '2023-05-01 16:00:00', '2024-05-01 02:00:00', FALSE, 1, 1);


INSERT INTO schedule (user_id, startDate, endDate, startTime, endTime, title) VALUES
(1, '2024-03-15', '2024-03-20', '08:00', '16:00', 'Availability'),
(2, '2024-03-26', '2024-03-30', '10:00', '18:00', 'Availability'),
(3, '2024-04-03', '2024-04-10', '09:00', '17:00', 'Availability'),
(4, '2024-04-06', '2024-04-13', '11:00', '19:00', 'Availability'),
(5, '2024-03-18', '2024-03-21', '07:00', '15:00', 'Availability'),
(6, '2024-03-22', '2024-03-25', '08:30', '16:30', 'Availability'),
(7, '2024-03-28', '2024-04-02', '09:30', '17:30', 'Availability'),
(8, '2024-04-01', '2024-04-05', '12:00', '20:00', 'Availability'),
(9, '2024-04-08', '2024-04-12', '13:00', '21:00', 'Availability'),
(10, '2024-04-10', '2024-04-15', '07:30', '15:30', 'Availability');


INSERT INTO skills (skill_name) VALUES
('Business Management'),
('Communication'),
('Customer Service'),
('Food Safety Knowledge'),
('Public Security'),
('French'),
('Manadrin'),
('Cantonese');

INSERT INTO workers_skills (workers_id, skill_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6);

INSERT INTO experiences (experience_name) VALUES
('Event Staffing'),
('Hospitality Services'),
('Retail Assistance'),
('Delivery Services'),
('Maintenance and Repair'),
('Personal Services'),
('Construction and Renovation'),
('Healthcare Assistance'),
('Transportation Services'),
('Technical Support'),
('Cleaning Services'),
('Fitness Instruction'),
('Photography and Videography'),
('Creative Services'),
('Security Services');

INSERT INTO workers_experiences (workers_id, experience_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6);

INSERT INTO traits (trait_name) VALUES
('Adaptable'),
('Initiative'),
('Creative'),
('Problem-Solving'),
('Team Collaboration'),
('Leadership'),
('Attention to Detail'),
('Accountability'),
('Empathy'),
('Resilience');

INSERT INTO workers_traits (workers_id, trait_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6);
