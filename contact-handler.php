<?php
/**
 * Contact form handler: verifies reCAPTCHA v2 server-side, then emails the submission.
 * Secrets (reCAPTCHA secret key, recipient address) live outside the web/git root in
 * /home/123techgroup.dev/shirlawgroup-secrets/config.php and are never committed to git.
 */

header('Content-Type: application/json');

$secretsFile = '/home/123techgroup.dev/shirlawgroup-secrets/config.php';
if (!file_exists($secretsFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server is not configured yet.']);
    exit;
}
require $secretsFile; // defines RECAPTCHA_SECRET_KEY and CONTACT_TO_EMAIL

function respond(bool $success, string $message = ''): void {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Invalid request method.');
}

$firstName   = trim($_POST['first_name'] ?? '');
$lastName    = trim($_POST['last_name'] ?? '');
$email       = trim($_POST['email'] ?? '');
$phone       = trim($_POST['phone'] ?? '');
$practiceArea = trim($_POST['practice_area'] ?? '');
$subject     = trim($_POST['subject'] ?? '');
$message     = trim($_POST['message'] ?? '');
$recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';

if ($firstName === '' || $lastName === '' || $email === '' || $practiceArea === '' || $subject === '') {
    respond(false, 'Please fill in all required fields.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.');
}
if ($recaptchaResponse === '') {
    respond(false, 'Please complete the reCAPTCHA.');
}

// Verify reCAPTCHA v2 with Google
$verify = file_get_contents('https://www.google.com/recaptcha/api/siteverify?' . http_build_query([
    'secret'   => RECAPTCHA_SECRET_KEY,
    'response' => $recaptchaResponse,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
]));
$result = json_decode($verify, true);
if (empty($result['success'])) {
    respond(false, 'reCAPTCHA verification failed. Please try again.');
}

// Build and send the email
$to = CONTACT_TO_EMAIL;
$emailSubject = 'Shir Law Group Website Inquiry: ' . $subject;
$body = "New contact form submission\n\n"
    . "Name: {$firstName} {$lastName}\n"
    . "Email: {$email}\n"
    . "Phone: " . ($phone !== '' ? $phone : 'Not provided') . "\n"
    . "Practice Area: {$practiceArea}\n"
    . "Subject: {$subject}\n\n"
    . "Message:\n{$message}\n";

$headers = "From: no-reply@123techgroup.dev\r\n"
    . "Reply-To: " . str_replace(["\r", "\n"], '', $email) . "\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $emailSubject, $body, $headers);

if ($sent) {
    respond(true);
} else {
    respond(false, 'Message could not be sent. Please call us directly.');
}
