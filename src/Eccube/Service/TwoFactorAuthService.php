public function sendSmsCode($phoneNumber, $code)
{
    // Use the SMS service to send the code
    // Example with Twilio
    $this->twilioClient->messages->create(
        $phoneNumber,
        [
            'from' => $this->twilioNumber,
            'body' => "Your verification code is: $code"
        ]
    );
}
