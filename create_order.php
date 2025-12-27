<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/razorpay-php/Razorpay.php';
use Razorpay\Api\Api;

$keyId = trim('rzp_live_RepiLZiTWey4mz');
$keySecret = trim('vMHtSxv2zB1WHPtKAFYbZoL7');

header('Content-Type: application/json');

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $amount = isset($input['amount']) ? intval($input['amount']) * 100 : 10000; // in paise

    file_put_contents(__DIR__.'/debug.log', "Amount received: $amount\n", FILE_APPEND);

    $api = new Api($keyId, $keySecret);

    $orderData = [
        'receipt' => 'receipt_' . time(),
        'amount' => $amount,
        'currency' => 'INR',
        'payment_capture' => 1
    ];

    $order = $api->order->create($orderData);

    file_put_contents(__DIR__.'/debug.log', "Order created: ".$order['id']."\n", FILE_APPEND);

    echo json_encode([
        'id' => $order['id'],
        'amount' => $order['amount'],
        'currency' => $order['currency'],
        'key' => $keyId
    ]);

} catch (\Exception $e) {
    file_put_contents(__DIR__.'/debug.log', "Error: ".$e->getMessage()."\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
