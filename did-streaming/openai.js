export async function fetchOpenAIResponse(apiKey, userMessage) {
  try {
    console.log('Fetching response from backend for:', userMessage);
    // Use your backend server for consistent medical responses
    const response = await fetch('http://localhost:5051/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        user_id: 'avatar_user'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    const responseText = data.reply || data.response || data.message;
    console.log('Backend response:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from backend');
    }
    
    // Clean up the response for avatar speech (remove markdown formatting)
    const cleanResponse = responseText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\n\s*\n/g, '. ') // Replace multiple newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .trim();
    
    return cleanResponse;
  } catch (error) {
    console.error('Backend Error:', error);
    
    // Final fallback - simple medical responses
    if (userMessage.toLowerCase().includes('headache')) {
      return "I'm sorry to hear you're experiencing a headache. Try to rest in a quiet, dark room, stay hydrated, and consider a cool compress on your forehead. If the headache is severe, persistent, or accompanied by fever, vision changes, or neck stiffness, please seek medical attention immediately.";
    }
    if (userMessage.toLowerCase().includes('fever') || userMessage.toLowerCase().includes('sick')) {
      return "I'm concerned about your symptoms. Please monitor your temperature, stay well hydrated, and get plenty of rest. If your fever exceeds 101°F, persists for more than 3 days, or you develop difficulty breathing, please seek medical attention promptly.";
    }
    if (userMessage.toLowerCase().includes('pain') || userMessage.toLowerCase().includes('hurt')) {
      return "I understand you're experiencing discomfort. While I can provide general guidance, persistent or severe pain should be evaluated by a healthcare professional to determine the underlying cause and appropriate treatment.";
    }
    if (userMessage.toLowerCase().includes('throat') || userMessage.toLowerCase().includes('sore')) {
      return "A sore throat can be quite uncomfortable. Try warm salt water gargles, stay hydrated, and get plenty of rest. If symptoms worsen or you develop difficulty swallowing or breathing, please seek medical attention.";
    }
    return "Thank you for sharing your concern with me. While I can offer general health guidance, I strongly recommend consulting with a healthcare professional for proper medical evaluation and personalized care.";
  }
}