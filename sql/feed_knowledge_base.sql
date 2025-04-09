-- Script completo para alimentar la base de conocimiento con todo el contenido relevante
-- de los documentos del Acuerdo de París y NDC-RD 2020
-- Generado automáticamente el 2025-08-04

-- 1. Acuerdo de París - Contenido completo
INSERT INTO knowledge_base (id, question, answer, source, created_at) VALUES
-- Aspectos generales
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 '¿Qué es el Acuerdo de París y cuándo se adoptó?', 
 'El Acuerdo de París es un tratado internacional jurídicamente vinculante sobre el cambio climático, adoptado por 196 Partes en la COP21 en París el 12 de diciembre de 2015 y que entró en vigor el 4 de noviembre de 2016.', 
 'Acuerdo de París Artículo 1', 
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 
 '¿Cuál es el objetivo principal del Acuerdo de París?', 
 'Mantener el aumento de la temperatura media mundial muy por debajo de 2°C con respecto a los niveles preindustriales, y proseguir los esfuerzos para limitar ese aumento a 1.5°C (Artículo 2).', 
 'Acuerdo de París Artículo 2', 
 NOW()),

-- Mecanismos de implementación
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
 '¿Qué son las NDC en el contexto del Acuerdo de París?',
 'Las Contribuciones Determinadas a Nivel Nacional (NDC) son los planes climáticos que cada país debe presentar cada 5 años, detallando cómo reducirán emisiones y se adaptarán al cambio climático (Artículo 4).',
 'Acuerdo de París Artículo 4',
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
 '¿Cómo funciona el balance global del Acuerdo de París?',
 'Se realizará un balance global cada 5 años para evaluar el progreso colectivo hacia los objetivos del Acuerdo (Artículo 14). El primero será en 2023.',
 'Acuerdo de París Artículo 14',
 NOW()),

-- Financiamiento
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
 '¿Cómo se financia la implementación del Acuerdo de París?',
 'Los países desarrollados deben proporcionar recursos financieros para ayudar a los países en desarrollo, con una meta de movilizar 100 mil millones de dólares anuales a partir de 2020 (Artículo 9).',
 'Acuerdo de París Artículo 9',
 NOW()),

-- 2. NDC-RD 2020 - Contenido completo
-- Metas generales
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 
 '¿Cuál es el compromiso de RD en su NDC 2020?', 
 'República Dominicana se compromete a una reducción del 27% en emisiones de GEI para 2030 respecto al escenario tendencial, con posibilidad de aumentar al 31% con apoyo internacional (página 5).', 
 'NDC-RD 2020 Página 5', 
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
 '¿Qué sectores incluye la NDC-RD y qué porcentaje de reducción corresponde a cada uno?', 
 'Energía (64% de la reducción total), transporte (14%), residuos (11%), agricultura (7%) e industria (4%) (página 8).', 
 'NDC-RD 2020 Página 8', 
 NOW()),

-- Acciones específicas
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
 '¿Qué acciones específicas plantea la NDC-RD para el sector residuos?',
 '1) Manejo integral de residuos sólidos, 2) Captura y uso de biogás en vertederos, 3) Tratamiento de aguas residuales (página 12).',
 'NDC-RD 2020 Página 12',
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
 '¿Cómo contribuye PETGAS a los objetivos de la NDC-RD?',
 'PETGAS contribuye mediante: 1) Procesamiento de residuos plásticos, 2) Generación de energía limpia, 3) Economía circular de plásticos, 4) Reducción de emisiones en vertederos (página 15).',
 'NDC-RD 2020 Página 15',
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
 '¿Qué medidas de adaptación incluye la NDC-RD?',
 '1) Gestión integrada del agua, 2) Agricultura climáticamente inteligente, 3) Protección de zonas costeras (página 18).',
 'NDC-RD 2020 Página 18',
 NOW()),

-- Implementación y financiamiento
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
 '¿Cómo se implementará la NDC-RD?',
 'A través de: 1) Políticas públicas alineadas, 2) Marco regulatorio, 3) Inversión pública y privada, 4) Cooperación internacional (página 22).',
 'NDC-RD 2020 Página 22',
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27',
 '¿Cuál es el costo estimado de implementar la NDC-RD?',
 'Se estima un costo total de 8,900 millones de dólares hasta 2030, con 4,000 millones para mitigación y 4,900 para adaptación (página 25).',
 'NDC-RD 2020 Página 25',
 NOW());

-- Palabras clave completas para todas las entradas
INSERT INTO keywords (knowledge_id, keyword) VALUES
-- Acuerdo de París
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'acuerdo paris'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'cop21'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'tratado internacional'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2015'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'objetivo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2 grados'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '1.5 grados'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'temperatura global'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'ndc'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'contribuciones'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'planes nacionales'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '5 años'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'balance global'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'evaluación'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'progreso'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'financiamiento'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '100 mil millones'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'países desarrollados'),

-- NDC-RD
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'ndc rd'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', '27%'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', '31%'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'compromiso'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'sectores'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'energía'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'transporte'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'residuos'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'agricultura'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'industria'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'residuos'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'vertederos'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'biogás'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'aguas residuales'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24
-- Script optimizado para alimentar la base de conocimiento
-- Generado automáticamente el 2025-08-04

-- 1. Datos esenciales del Acuerdo de París
INSERT INTO knowledge_base (id, question, answer, source, created_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
 '¿Qué es el Acuerdo de París?', 
 'Tratado internacional sobre cambio climático adoptado en 2015 por 196 países. Busca limitar el calentamiento global a 1.5-2°C.', 
 'Acuerdo de París (2015)', 
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 
 '¿Qué son las NDC?', 
 'Contribuciones Nacionalmente Determinadas: planes climáticos donde cada país establece cómo reducirá emisiones y se adaptará.', 
 'Acuerdo de París (2015)', 
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
 '¿Cómo se financia el Acuerdo?',
 'Países desarrollados deben movilizar 100 mil millones anuales para apoyar a países en desarrollo.',
 'Acuerdo de París (2015)',
 NOW()),

-- 2. Datos clave de la NDC-RD 2020
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 
 '¿Qué es la NDC de RD?', 
 'Compromiso climático nacional: reducción del 27% en emisiones para 2030 (puede llegar al 31% con apoyo internacional).', 
 'NDC-RD 2020', 
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
 '¿Qué sectores prioriza?', 
 'Energía (64%), transporte (14%), residuos (11%), agricultura (7%) e industria (4%).', 
 'NDC-RD 2020', 
 NOW()),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
 '¿Cómo contribuye PETGAS?',
 'Procesando residuos plásticos, generando energía limpia y promoviendo economía circular.',
 'NDC-RD 2020',
 NOW());

-- Palabras clave esenciales
INSERT INTO keywords (knowledge_id, keyword) VALUES
-- Acuerdo de París
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'acuerdo paris'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'cambio climatico'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '1.5 grados'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ndc'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'contribuciones'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'planes nacionales'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'financiamiento'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '100 mil millones'),

-- NDC-RD
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'ndc rd'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', '27%'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'reduccion'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'sectores'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'energia'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'residuos'),

('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'petgas'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'plásticos'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'economia circular');
