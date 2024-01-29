-- Query 1
INSERT INTO public.account (account_id, account_firstname, account_lastname, account_email, account_password)
VALUES (1, 'Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Query 2
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- Query 3
DELETE FROM public.account
WHERE account_id = 1;

-- Query 4
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

-- Query 5
SELECT inventory.inv_make, inventory.inv_model, classification.classification_name
FROM public.inventory
INNER JOIN public.classification
ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

-- Query 6
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


