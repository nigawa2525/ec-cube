if ('POST' === $request->getMethod()) {
    $form->handleRequest($request);
    if ($form->isSubmitted() && $form->isValid()) {
        $code = rand(100000, 999999); // Generate a random 6-digit code
        $this->twoFactorAuthService->sendSmsCode($Member->getPhoneNumber(), $code);
        // Store the code in session or database for later verification
        $this->session->set('2fa_code', $code);
    }
}
if ($form->isSubmitted() && $form->isValid()) {
    $enteredCode = $form->get('device_token')->getData();
    $storedCode = $this->session->get('2fa_code');
    if ($enteredCode == $storedCode) {
        // Proceed with authentication
    } else {
        $error = trans('admin.setting.system.two_factor_auth.invalid_message__reinput');
    }
}
