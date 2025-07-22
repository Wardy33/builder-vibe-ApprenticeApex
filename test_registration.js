const testData = {
  companyName: "Test Company Ltd",
  industry: "Technology", 
  companySize: "1-10 employees",
  website: "https://testcompany.com",
  description: "A test company for registration testing",
  firstName: "John",
  lastName: "Doe", 
  position: "CEO",
  email: "test@testcompany.com",
  address: "123 Test Street",
  city: "London",
  postcode: "SW1A 1AA",
  password: "testpassword123",
  termsAccepted: true,
  privacyAccepted: true,
  noPoacingAccepted: true,
  exclusivityAccepted: true,
  dataProcessingAccepted: true
};

async function testRegistration() {
  try {
    console.log('Testing company registration...');
    
    const response = await fetch('http://localhost:8080/api/auth/company/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      
      // Test signin with the same credentials
      console.log('\nTesting signin...');
      const signinResponse = await fetch('http://localhost:8080/api/auth/company/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testData.email,
          password: testData.password
        })
      });
      
      console.log('Signin response status:', signinResponse.status);
      const signinData = await signinResponse.json();
      console.log('Signin response data:', signinData);
      
      if (signinResponse.ok) {
        console.log('✅ Signin successful!');
        console.log('🎉 All tests passed!');
      } else {
        console.log('❌ Signin failed');
      }
      
    } else {
      console.log('❌ Registration failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRegistration();
