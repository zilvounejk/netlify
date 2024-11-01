function parseCustomText(inputText) {
    
    // Convert *text* to <strong>text</strong>

    const newLineParsed = inputText.replace(/\\n/g, "<br>");

    const boldParsed = newLineParsed.replace(/\*\*(.*?)\*\*/g, '<strong><i>$1</i></strong>');
    
    const italicParsed = boldParsed.replace(/\*(.*?)\*/g, '<i>$1</i>');
    
    // Convert ##text## to <big>text</big>
    const bigTextParsed = italicParsed.replace(/##(.*?)<br>/g, '<big><strong>$1</strong></big>');

    const responseTrimmed = bigTextParsed.replace('{"response":"', "").replace('"}', "");

    return responseTrimmed;
}


const buttons = document.querySelectorAll('.baseqtn');

let value = "";

// Loop through each button and add an event listener
buttons.forEach(button => {
  button.addEventListener('click', () => {
    // Update the value with the text of the clicked button
    value = button.textContent;
    // Run the main function
    run();
  });
});

const inputField = document.querySelector(".chat-input");

inputField.addEventListener("keydown", logKey);

function logKey(e) {
  if (e.code === "Enter") {
    run();
  };
}

async function run() {
    const input = document.querySelector(".chat-input");
    const output = document.querySelector(".output-line");

    // Decide the prompt based on `value` or `input.value`
    let prompt = value !== "" ? value : input.value.trim();
    input.value = ""; // Clear the input field

    // Hide all buttons
    buttons.forEach(button => {
        button.style.display = 'none';
    });

    if (prompt !== "") {
        const promptDiv = document.createElement("div");
        promptDiv.className = "prompt"; // Set the class name to "prompt"

        // Create a paragraph element for the prompt text
        const promptText = document.createElement("p");
        promptText.textContent = prompt; // Set the text content to the prompt

        // Append the paragraph to the div
        promptDiv.appendChild(promptText);

        // Inject the promptDiv into the output element
        output.appendChild(promptDiv);
        scrollToChatBottom()

        const czechPrompt = `${prompt} \n Prosím, odpověz v češtině`; // Adding a request for the response to be in Czech

        try {
            const response = await fetch('../netlify/functions/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: czechPrompt })
            });
            

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${response.status} - ${errorData.error || "Unknown error"}`);
            }

            const data = await response.json();
            const returnedData = await parseCustomText(JSON.stringify(data))// Get the response data
            console.log(returnedData); // Log the data
            
            // Create a new div for the output response
            const outputDiv = document.createElement("div");
            outputDiv.className = "output-prompt"; // Set the class name for output

            // Create a paragraph for the response text
            const outputText = document.createElement("p");
            outputText.innerHTML = returnedData; // Set the text content to the AI's response
            
            // Append the output text paragraph to the outputDiv
            outputDiv.appendChild(outputText);
            
            // Inject the outputDiv into the output element
            output.appendChild(outputDiv); // Display the generated response
            scrollToChatBottom()
        } catch (error) {
            output.textContent = "Jejda! Něco se pokazilo, obnov ztránku a zkus to znovu.";
        }
    }
}

function scrollToChatBottom() {
    const chatOutput = document.querySelector('.chat-output');
    chatOutput.scrollTo({
        top: chatOutput.scrollHeight + 2000,
        left: 0,
        behavior: "smooth",
      });
};
