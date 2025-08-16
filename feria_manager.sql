CREATE DATABASE IF NOT EXISTS feria_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE feria_manager;

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
  UNIQUE KEY uq_clientes_id_user (id, user_id), -- para FKs compuestas desde pedidos
  CONSTRAINT fk_clientes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  cantidad INT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_productos_user (user_id),
  UNIQUE KEY uq_productos_user_nombre (user_id, nombre),
  UNIQUE KEY uq_productos_id_user (id, user_id), -- para FKs compuestas desde pedidos
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
  KEY idx_pedidos_cliente_id_user (cliente_id, user_id),
  KEY idx_pedidos_producto_id_user (producto_id, user_id),
  CONSTRAINT fk_pedidos_user     FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  -- Asegura que el cliente pertenece al mismo user:
  CONSTRAINT fk_pedidos_cliente  FOREIGN KEY (cliente_id, user_id)
    REFERENCES clientes (id, user_id) ON DELETE CASCADE,
  -- Asegura que el producto pertenece al mismo user:
  CONSTRAINT fk_pedidos_producto FOREIGN KEY (producto_id, user_id)
    REFERENCES productos (id, user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
