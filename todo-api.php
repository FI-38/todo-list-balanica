<?php
// todo-api.php
header('Content-Type: application/json; charset=utf-8');

// Ruta del "almacén"
$file = __DIR__ . '/todo.json';

// Utilidad: leer array desde JSON (si no existe, array vacío)
function read_todos($file) {
  if (file_exists($file)) {
    $json = file_get_contents($file);
    $data = json_decode($json, true);
    if (is_array($data)) return $data;
  }
  return [];
}

// Utilidad: guardar array en JSON "bonito"
function write_todos($file, $arr) {
  return file_put_contents($file, json_encode(array_values($arr), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Cargar estado actual
$todos = read_todos($file);

// Determinar método
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Cuerpo JSON (para POST/PUT/DELETE)
$raw = file_get_contents('php://input');
$input = $raw ? json_decode($raw, true) : [];

// CRUD
switch ($method) {
  case 'GET':
    // Devolver todos los TODOs como array de strings
    echo json_encode($todos);
    break;

  case 'POST':
    // Crear nuevo TODO: { "todo": "texto" }
    $text = isset($input['todo']) ? trim($input['todo']) : '';
    if ($text === '') {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Campo "todo" vacío']);
      break;
    }
    $todos[] = $text;
    write_todos($file, $todos);
    echo json_encode(['status' => 'success', 'message' => 'TODO creado', 'count' => count($todos)]);
    break;

  case 'PUT':
    // Actualizar por índice: { "index": N, "todo": "nuevo texto" }
    if (!isset($input['index']) || !isset($input['todo'])) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Faltan "index" o "todo"']);
      break;
    }
    $idx = intval($input['index']);
    $newText = trim($input['todo']);
    if ($newText === '' || !isset($todos[$idx])) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Índice inválido o texto vacío']);
      break;
    }
    $todos[$idx] = $newText;
    write_todos($file, $todos);
    echo json_encode(['status' => 'success', 'message' => 'TODO actualizado']);
    break;

  case 'DELETE':
    // Eliminar por índice: { "index": N }
    if (!isset($input['index'])) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Falta "index"']);
      break;
    }
    $idx = intval($input['index']);
    if (!isset($todos[$idx])) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Índice inválido']);
      break;
    }
    array_splice($todos, $idx, 1);
    write_todos($file, $todos);
    echo json_encode(['status' => 'success', 'message' => 'TODO eliminado']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
    break;
}

