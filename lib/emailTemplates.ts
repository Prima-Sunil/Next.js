export const getVerificationEmailTemplate = (name: string, verificationUrl: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body class="bg-gray-100 p-4">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Header Section -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <h1 class="text-2xl font-bold text-white">Email Verification</h1>
          </div>
          
          <!-- Main Content -->
          <div class="p-8">
            <!-- Welcome Message -->
            <div class="text-center mb-8">
              <h2 class="text-2xl font-semibold text-gray-800 mb-2">Welcome, ${name}!</h2>
              <p class="text-gray-600">
                Thanks for joining us! Please verify your email address to get started.
              </p>
            </div>
            
            <!-- Verification Button -->
            <div class="text-center mb-8">
              <a href="${verificationUrl}"
                 class="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg 
                        transition-colors duration-200 transform hover:scale-105">
                Verify Email Address
              </a>
            </div>
            
            <!-- Time Notice -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p class="text-blue-800 text-center text-sm">
                ⏰ This verification link will expire in 24 hours
              </p>
            </div>
            
            <!-- Security Notice -->
            <div class="text-center mb-8">
              <p class="text-gray-600 text-sm">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            
            <!-- Fallback URL Section -->
            <div class="border-t border-gray-200 pt-6 mt-6">
              <p class="text-gray-600 text-sm mb-2">
                If you're having trouble with the button above, copy and paste the URL below into your web browser:
              </p>
              <p class="text-blue-600 text-sm break-all">
                ${verificationUrl}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };