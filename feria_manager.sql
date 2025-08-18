-- ================== PARÁMETROS ==================
SET @APP_DB    := 'feria_manager';
SET @APP_USER  := 'feria';                -- usuario de la app
SET @APP_PASS  := 'elperromax@123elgatoeren666#';  -- contraseña fuerte
SET @APP_HOST  := 'localhost';            -- 'localhost' si la app corre en la misma EC2

-- ============== CREAR DB Y USUARIO ==============
SET @sql := CONCAT('CREATE DATABASE IF NOT EXISTS `', @APP_DB,
                   '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := CONCAT('CREATE USER IF NOT EXISTS ''', @APP_USER, '''@''', @APP_HOST,
                   ''' IDENTIFIED BY ''', @APP_PASS, ''';');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := CONCAT('GRANT ALL PRIVILEGES ON `', @APP_DB, '`.* TO ''',
                   @APP_USER, '''@''', @APP_HOST, ''';');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

FLUSH PRIVILEGES;

-- Usar la DB
SET @sql := CONCAT('USE `', @APP_DB, '`;');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ================== ESQUEMA ======================
-- USERS
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  google_sub VARCHAR(64) NOT NULL,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  picture VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_google_sub (google_sub),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(191) NOT NULL,
  telefono VARCHAR(50) NULL,
  direccion VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_clientes_user (user_id),
  UNIQUE KEY uq_clientes_user_nombre (user_id, nombre),
  UNIQUE KEY uq_clientes_id_user (id, user_id),
  CONSTRAINT fk_clientes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  cantidad INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_productos_user (user_id),
  UNIQUE KEY uq_productos_user_nombre (user_id, nombre),
  UNIQUE KEY uq_productos_id_user (id, user_id),
  CONSTRAINT fk_productos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  cliente_id INT UNSIGNED NOT NULL,
  producto_id BIGINT UNSIGNED NOT NULL,
  cantidad INT NOT NULL,
  fecha_entrega DATE NOT NULL,
  estado ENUM('Pendiente', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pedidos_user (user_id),
  KEY idx_pedidos_user_estado (user_id, estado),
  KEY idx_pedidos_user_fecha (user_id, fecha_entrega),
  KEY idx_pedidos_cliente_id_user (cliente_id, user_id),
  KEY idx_pedidos_producto_id_user (producto_id, user_id),
  CONSTRAINT fk_pedidos_user     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_pedidos_cliente  FOREIGN KEY (cliente_id, user_id)
    REFERENCES clientes (id, user_id) ON DELETE CASCADE,
  CONSTRAINT fk_pedidos_producto FOREIGN KEY (producto_id, user_id)
    REFERENCES productos (id, user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================= TRIGGERS ======================
DELIMITER $$

-- CLIENTES: lowercase + trim
DROP TRIGGER IF EXISTS trg_clientes_bi $$
CREATE TRIGGER trg_clientes_bi
BEFORE INSERT ON clientes
FOR EACH ROW
BEGIN
  SET NEW.nombre    = LOWER(TRIM(NEW.nombre));
  SET NEW.telefono  = IFNULL(LOWER(TRIM(NEW.telefono)), NULL);
  SET NEW.direccion = IFNULL(LOWER(TRIM(NEW.direccion)), NULL);
END $$

DROP TRIGGER IF EXISTS trg_clientes_bu $$
CREATE TRIGGER trg_clientes_bu
BEFORE UPDATE ON clientes
FOR EACH ROW
BEGIN
  SET NEW.nombre    = LOWER(TRIM(NEW.nombre));
  SET NEW.telefono  = IFNULL(LOWER(TRIM(NEW.telefono)), NULL);
  SET NEW.direccion = IFNULL(LOWER(TRIM(NEW.direccion)), NULL);
END $$

-- PRODUCTOS: lowercase + trim; cantidad no negativa
DROP TRIGGER IF EXISTS trg_productos_bi $$
CREATE TRIGGER trg_productos_bi
BEFORE INSERT ON productos
FOR EACH ROW
BEGIN
  SET NEW.nombre = LOWER(TRIM(NEW.nombre));
  IF NEW.cantidad IS NULL OR NEW.cantidad < 0 THEN
    SET NEW.cantidad = 0;
  END IF;
END $$

DROP TRIGGER IF EXISTS trg_productos_bu $$
CREATE TRIGGER trg_productos_bu
BEFORE UPDATE ON productos
FOR EACH ROW
BEGIN
  SET NEW.nombre = LOWER(TRIM(NEW.nombre));
  IF NEW.cantidad IS NULL OR NEW.cantidad < 0 THEN
    SET NEW.cantidad = 0;
  END IF;
END $$

-- PEDIDOS: cantidad mínima 1
DROP TRIGGER IF EXISTS trg_pedidos_bi $$
CREATE TRIGGER trg_pedidos_bi
BEFORE INSERT ON pedidos
FOR EACH ROW
BEGIN
  IF NEW.cantidad IS NULL OR NEW.cantidad < 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'cantidad debe ser >= 1';
  END IF;
END $$

DROP TRIGGER IF EXISTS trg_pedidos_bu $$
CREATE TRIGGER trg_pedidos_bu
BEFORE UPDATE ON pedidos
FOR EACH ROW
BEGIN
  IF NEW.cantidad IS NULL OR NEW.cantidad < 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'cantidad debe ser >= 1';
  END IF;
END $$

DELIMITER ;

-- ================== VISTA ========================
CREATE OR REPLACE VIEW vw_pedidos_detalle AS
SELECT
  p.id,
  p.user_id,
  p.cliente_id,
  c.nombre  AS cliente_nombre,
  p.producto_id,
  pr.nombre AS producto_nombre,
  p.cantidad,
  p.fecha_entrega,
  p.estado,
  p.created_at,
  p.updated_at
FROM pedidos p
JOIN clientes  c  ON c.id  = p.cliente_id  AND c.user_id  = p.user_id
JOIN productos pr ON pr.id = p.producto_id AND pr.user_id = p.user_id;
