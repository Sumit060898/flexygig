-- LOCATIONS
INSERT INTO locations (streetaddress, city, province, postalcode) VALUES
('123 Main St', 'Phoenix', 'AZ', '85001'),
('456 Oak Ave', 'Dallas', 'TX', '75201'),
('789 Maple Rd', 'Denver', 'CO', '80201'),
('321 Pine Blvd', 'Miami', 'FL', '33101'),
('654 Cedar Ln', 'Seattle', 'WA', '98101'),
('101 Birch St', 'Chicago', 'IL', '60601'),
('202 Elm Dr', 'Atlanta', 'GA', '30301'),
('303 Palm Blvd', 'Los Angeles', 'CA', '90001'),
('404 Spruce Ln', 'Houston', 'TX', '77001'),
('505 Fir Ave', 'Boston', 'MA', '02101');

-- USERS
INSERT INTO users (isbusiness, email, password, active, signUpDate, user_phone_number, user_address) VALUES
(false, 'melody.jackson@example.com', 'password123', true, CURRENT_TIMESTAMP, '123-456-7890', 1),
(false, 'frank.james@example.com', 'password123', true, CURRENT_TIMESTAMP, '234-567-8901', 2),
(false, 'jessica.brown@example.com', 'password123', true, CURRENT_TIMESTAMP, '345-678-9012', 3),
(false, 'michael.smith@example.com', 'password123', true, CURRENT_TIMESTAMP, '456-789-0123', 4),
(false, 'sarah.davis@example.com', 'password123', true, CURRENT_TIMESTAMP, '567-890-1234', 5),
(false, 'david.lee@example.com', 'password123', true, CURRENT_TIMESTAMP, '678-901-2345', 6),
(true, 'meatyfoods@example.com', 'password123', true, CURRENT_TIMESTAMP, '789-012-3456', 7),
(true, 'techsolutions@example.com', 'password123', true, CURRENT_TIMESTAMP, '890-123-4567', 8),
(true, 'greenworld@example.com', 'password123', true, CURRENT_TIMESTAMP, '901-234-5678', 9),
(true, 'buildwise@example.com', 'password123', true, CURRENT_TIMESTAMP, '012-345-6789', 10)
ON CONFLICT (email) DO NOTHING;


-- WORKERS
INSERT INTO workers (user_id, first_name, last_name, biography, desired_work_radius, desired_pay) VALUES
(1, 'Melody', 'Jackson', 'Experienced plumber', 20, 30),
(2, 'Frank', 'James', 'Reliable electrician', 30, 28),
(3, 'Jessica', 'Brown', 'Construction worker', 25, 27),
(4, 'Michael', 'Smith', 'Welder', 35, 32),
(5, 'Sarah', 'Davis', 'House painter', 15, 22),
(6, 'David', 'Lee', 'Landscaper', 40, 29);

-- BUSINESSES
INSERT INTO businesses (user_id, business_name, business_description) VALUES
(7, 'Meaty Foods', 'Quality meats supplier'),
(8, 'Tech Solutions', 'Small business IT support'),
(9, 'Green World', 'Eco-friendly landscaping'),
(10, 'BuildWise', 'Commercial construction experts');

-- SCHEDULE
INSERT INTO schedule (user_id, startDate, endDate, startTime, endTime, title) VALUES
(1, '2024-03-15', '2024-03-20', '08:00', '16:00', 'Available'),
(2, '2024-03-26', '2024-03-30', '10:00', '18:00', 'Available'),
(3, '2024-04-03', '2024-04-10', '09:00', '17:00', 'Available'),
(4, '2024-04-06', '2024-04-13', '11:00', '19:00', 'Available'),
(5, '2024-03-18', '2024-03-21', '07:00', '15:00', 'Available'),
(6, '2024-03-22', '2024-03-25', '08:30', '16:30', 'Available'),
(7, '2024-03-28', '2024-04-02', '09:30', '17:30', 'Available'),
(8, '2024-04-01', '2024-04-05', '12:00', '20:00', 'Available'),
(9, '2024-04-08', '2024-04-12', '13:00', '21:00', 'Available'),
(10, '2024-04-10', '2024-04-15', '07:30', '15:30', 'Available');



-- SKILLS 
INSERT INTO skills (skill_name) VALUES
  ('Business Management'),
  ('Communication'),
  ('Customer Service'),
  ('Food Safety Knowledge'),
  ('Public Security'),
  ('French'),
  ('Manadrin'),
  ('Cantonese')
ON CONFLICT (skill_name) DO NOTHING;

-- EXPERIENCES
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
  ('Security Services')
ON CONFLICT (experience_name) DO NOTHING;

-- TRAITS 
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
  ('Resilience')
ON CONFLICT (trait_name) DO NOTHING;



-- WORKERS_SKILLS
INSERT INTO workers_skills (workers_id, skill_id) VALUES
(1, 2),
(1, 1),
(2, 2),
(2, 6),
(3, 1),
(3, 8),
(4, 1),
(4, 5),
(5, 8),
(5, 5),
(6, 3),
(6, 6);

-- WORKERS_TRAITS
INSERT INTO workers_traits (workers_id, trait_id) VALUES
(1, 5),
(1, 4),
(2, 9),
(2, 2),
(3, 2),
(3, 4),
(4, 4),
(4, 9),
(5, 5),
(5, 1),
(6, 7),
(6, 6);

-- WORKERS_EXPERIENCES
INSERT INTO workers_experiences (workers_id, experience_id) VALUES
(1, 4),
(1, 3),
(2, 10),
(2, 7),
(3, 4),
(3, 9),
(4, 7),
(4, 4),
(5, 13),
(5, 15),
(6, 5),
(6, 3);

-- JOB POSTINGS
INSERT INTO jobPostings (jobTitle, jobType, jobDescription, hourlyRate, jobStart, jobEnd, jobfilled, location_id, user_id) VALUES
('Butcher', 'Contract', 'Help with food preparation and delivery at Meaty Foods.', 18, '2024-05-02', '2024-05-21', FALSE, 7, 7),
('Butcher', 'Contract', 'Help with food preparation and delivery at Meaty Foods.', 26, '2024-05-10', '2024-05-25', FALSE, 7, 7),
('IT Support Technician', 'Temporary', 'Assist Tech Solutions clients with IT troubleshooting and software installs.', 32, '2024-05-02', '2024-05-21', FALSE, 8, 8),
('IT Support Technician', 'Contract', 'Assist Tech Solutions clients with IT troubleshooting and software installs.', 35, '2024-05-10', '2024-05-28', FALSE, 8, 8),
('Eco Consultant', 'Part-time', 'Support Green World with sustainable landscaping projects.', 37, '2024-05-02', '2024-05-10', FALSE, 9, 9),
('Eco Consultant', 'Part-time', 'Support Green World with sustainable landscaping projects.', 39, '2024-05-05', '2024-05-14', FALSE, 9, 9),
('Construction Worker', 'Full-time', 'Work with BuildWise on construction and safety projects.', 27, '2024-05-05', '2024-05-26', FALSE, 10, 10),
('Site Safety Officer', 'Contract', 'Work with BuildWise on construction and safety projects.', 20, '2024-05-06', '2024-05-24', FALSE, 10, 10);
