// =================================================
// ✅ ➊ Paste your model URL
// =================================================
   const URL = "https://teachablemachine.withgoogle.com/models/CW_sn5DWv/";


// =================================================
// ✔️ Initialize the model and webcam
// =================================================
   // ⁉️ Assign variables
   let model, webcam, labelContainer, maxPredictions;
   // ⁉️ Tracks if a window has already been opened
   let hasOpenedWindow = false;
   // ⁉️ Probability threshold (80%) for triggering an action
   const THRESHOLD = 0.9;


   async function init() {
      // =================================================
      // ❌ No need to change
      // =================================================
      // ⁉️ URL + "model.json": Construct the model URL
      // ⁉️ URL + "metadata.json": Construct the metadata URL
      const modelURL = URL + "model.json"; 
      const metadataURL = URL + "metadata.json";

      // ⁉️ Load the model and get the number of prediction classes
      model = await tmImage.load(modelURL, metadataURL); 
      maxPredictions = model.getTotalClasses();

      // =================================================
      // ✅ ➋ new tmImage.Webcam(400, 400, true): 400x400 resolution
      //      🫲 true: mirror the webcam (flipped)
      //      🫱 false: showing the image as it is captured (not be flipped)
      // =================================================
      webcam = new tmImage.Webcam(400, 400, true); 
     
      // =================================================
      // ❌ No need to change
      // =================================================
      // ⁉️ Request access to the webcam
      await webcam.setup(); 
      // ⁉️ Start the webcam stream
      await webcam.play(); 
      // ⁉️ Start the loop function for continuous prediction
      requestAnimationFrame(loop); 

      // =================================================
      // ✔️ Create the webcam and label containers
      // =================================================
      // ⁉️ Append webcam canvas to the container
      $("#webcam-container").append(webcam.canvas); 
      // ⁉️ Select the label container for predictions
      labelContainer = $("#label-container"); 
      // ⁉️ Create a placeholder for each prediction label
      for (let i = 0; i < maxPredictions; i++) {
          labelContainer.append("<div></div>"); 
      }
   }


// =================================================
// ❌ No need to change: continuously updates the webcam feed and runs predictions in real-time
// =================================================
   async function loop() {
      // ⁉️ Update the webcam frame
      webcam.update();
      // ⁉️ Run prediction on the current frame
      await predict();
      // ⁉️ Continue the loop function for real-time updates
      requestAnimationFrame(loop);
   }


// =================================================
// ✔️ Runs the model’s prediction on the current webcam frame
// =================================================
   async function predict() {
      // ⁉️ Get predictions for the current webcam frame
      const prediction = await model.predict(webcam.canvas);
      // ⁉️ Create an array of probabilities from the prediction results
      const probabilities = prediction.map(p => p.probability);

      // ⁉️ Find the highest probability value
      let maxProb = Math.max(...probabilities);
      // ⁉️ Find the index of the highest probability class
      let maxIndex = probabilities.indexOf(maxProb);

      // =================================================
      // ✅ ➌ Apply _____ when a specific model is detected
      // =================================================
      if (maxIndex === 0) {
        document.querySelector("#mainText1").className = "variable1";
        document.querySelector("#mainText2").className = "variable1";
        document.querySelector("#mainText2").textContent = "Feb 27";
      } 
      else if (maxIndex === 1) {
        document.querySelector("#mainText1").className = "variable2";
        document.querySelector("#mainText2").className = "variable2";
        document.querySelector("#mainText2").textContent = "Fridiay";
      } 
      else if (maxIndex === 2) {
        document.querySelector("#mainText1").className = "variable1";
        document.querySelector("#mainText2").className = "variable2";
        document.querySelector("#mainText2").textContent = "4:30 PM";
        document.body.style.backgroundColor = "#00ff00";
      } 

      // =================================================
      // ✔️ Display prediction results on the screen
      // =================================================
      $("#label-container").children().each((index, element) => {
          $(element).text(prediction[index].className + ": " + prediction[index].probability.toFixed(2));
      });
     
      // =================================================
   }

// =================================================
// ❌ No need to change: automatically run init() after the page loads
// =================================================
   $(document).ready(init);