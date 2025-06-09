-- Create the routes table
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) CHECK (difficulty IN ('Fácil', 'Moderada', 'Difícil')) NOT NULL,
  image_url TEXT,
  available_spots INTEGER NOT NULL DEFAULT 0,
  duration VARCHAR(100),
  distance VARCHAR(100),
  elevation VARCHAR(100),
  meeting_point TEXT,
  date VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  document_id VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(50),
  route_id INTEGER REFERENCES routes(id),
  registration_type VARCHAR(50) CHECK (registration_type IN ('individual', 'group_leader', 'group_member', 'staff')) NOT NULL,
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',
  souvenir_status VARCHAR(50) CHECK (souvenir_status IN ('pending', 'delivered')) DEFAULT 'pending',
  registration_code VARCHAR(100),
  group_leader_id INTEGER REFERENCES registrations(id),
  role VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  registration_id INTEGER REFERENCES registrations(id),
  document_id VARCHAR(50) NOT NULL,
  receipt_number VARCHAR(100) NOT NULL,
  people_count INTEGER NOT NULL DEFAULT 1,
  receipt_image_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the event_settings table
CREATE TABLE IF NOT EXISTS event_settings (
  id SERIAL PRIMARY KEY,
  registration_price INTEGER NOT NULL DEFAULT 50000,
  bank_name VARCHAR(255),
  account_type VARCHAR(100),
  account_number VARCHAR(100),
  account_holder VARCHAR(255),
  nit VARCHAR(100),
  whatsapp_number VARCHAR(50),
  payment_instructions TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample routes
INSERT INTO routes (name, description, difficulty, image_url, available_spots, duration, distance, elevation, meeting_point, date) VALUES
('Sendero del Bosque', 'Un recorrido tranquilo a través de un hermoso bosque con vistas panorámicas. Durante el trayecto podrás observar diversas especies de aves y flora nativa.', 'Fácil', '/placeholder.svg?height=300&width=500', 25, '3 horas', '5 km', '150 m', 'Parque Central, entrada principal', '15 de junio, 2025'),
('Cascada Escondida', 'Ruta que te lleva a una impresionante cascada oculta entre montañas. El sendero incluye algunos tramos de dificultad moderada.', 'Moderada', '/placeholder.svg?height=300&width=500', 15, '4 horas', '7 km', '300 m', 'Estación de guardabosques', '22 de junio, 2025'),
('Cumbre del Águila', 'Ascenso desafiante con vistas espectaculares desde la cima. Requiere buena condición física y experiencia en senderismo.', 'Difícil', '/placeholder.svg?height=300&width=500', 10, '6 horas', '10 km', '800 m', 'Centro de visitantes', '29 de junio, 2025');

-- Insert sample gallery images
INSERT INTO gallery (url, alt) VALUES
('/placeholder.svg?height=400&width=600', 'Caminata grupal por el sendero'),
('/placeholder.svg?height=400&width=600', 'Vista panorámica desde la cumbre'),
('/placeholder.svg?height=400&width=600', 'Cascada en el recorrido'),
('/placeholder.svg?height=400&width=600', 'Grupo de participantes en el punto de encuentro'),
('/placeholder.svg?height=400&width=600', 'Sendero boscoso durante la caminata'),
('/placeholder.svg?height=400&width=600', 'Campamento base del evento');

-- Insert default event settings
INSERT INTO event_settings (registration_price, bank_name, account_type, account_number, account_holder, nit, whatsapp_number, payment_instructions) VALUES
(50000, 'Banco Nacional', 'Ahorros', '123-456789-0', 'Evento Caminera S.A.S.', '900.123.456-7', '+57 300 123 4567', 'Envía una foto del comprobante de pago al WhatsApp junto con tu número de cédula.');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_document_id ON registrations(document_id);
CREATE INDEX IF NOT EXISTS idx_registrations_route_id ON registrations(route_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_document_id ON payments(document_id);
