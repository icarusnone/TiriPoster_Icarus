// =================================================
// ✅ ➊ Paste your model URL
// =================================================
   const URL = "https://teachablemachine.withgoogle.com/models/SopMMy0Ni/";


// =================================================
// ✔️ Initialize the model and webcam
// =================================================
   // ⁉️ Assign variables
   let model, webcam, labelContainer, maxPredictions;
   // ⁉️ Tracks if a window has already been opened
   let hasOpenedWindow = false;
   // ⁉️ Tracks if index 3 has been triggered
   let hasTriggeredIndex3 = false;
   // 🆕 Tracks if headings should be shown (triggered by maxIndex === 1)
   let canShowHeadings = false;
   // ⁉️ Probability threshold (80%) for triggering an action
   const THRESHOLD = 0.9;


   // =================================================
   // 🆕 Responsive Logic for Headings
   // =================================================
   function updateHeadings() {
       const heading1 = document.getElementById("heading1");
       const heading2 = document.getElementById("heading2");
       const heading3 = document.getElementById("heading3");

       // If not allowed to show, hide everything and return
       if (!canShowHeadings) {
           heading1.style.display = "none";
           heading2.style.display = "none";
           heading3.style.display = "none";
           return;
       }

       const width = window.innerWidth;
       const maxWidth = window.screen.width; 
       // Minimum width of the window (e.g., typical mobile width or browser constraint)
       const minWidth = 400; 
       
       // Calculate the full range of resizing
       const range = maxWidth - minWidth;
       
       // Define the boundaries
       // Zone 1: [maxWidth, maxWidth - range * (1/3)] -> Heading 1
       // Zone 2: [maxWidth - range * (1/3), maxWidth - range * (2/3)] -> Heading 2
       // Zone 3: [maxWidth - range * (2/3), minWidth] -> Heading 3
       
       const boundary1 = maxWidth - range * (1/3); // 2/3 of the way from min to max (upper third)
       const boundary2 = maxWidth - range * (2/3); // 1/3 of the way from min to max (middle third)
       
       // Hide all initially
       heading1.style.display = "none";
       heading2.style.display = "none";
       heading3.style.display = "none";

       let minWeight = 100;
       let maxWeight = 1000;
       let weight = minWeight;

       // Zone 1: Widest -> 2/3 Width
       if (width > boundary1) {
           heading1.style.display = "block";
           // Progress: 0 at maxWidth, 1 at boundary1
           // current range = [maxWidth, boundary1]
           // span = maxWidth - boundary1 = range * (1/3)
           let progress = (maxWidth - width) / (range / 6);
           progress = Math.max(0, Math.min(1, progress));
           
           weight = minWeight + progress * (maxWeight - minWeight);
           heading1.style.fontVariationSettings = `"wght" ${weight}`;
       }
       // Zone 2: 2/3 Width -> 1/3 Width
       else if (width <= boundary1 && width > boundary2) {
           heading2.style.display = "block";
           // Progress: 0 at boundary1, 1 at boundary2
           // current range = [boundary1, boundary2]
           // span = boundary1 - boundary2 = range * (1/3)
           let progress = (boundary1 - width) / (range / 6);
           progress = Math.max(0, Math.min(1, progress));
           
           weight = minWeight + progress * (maxWeight - minWeight);
           heading2.style.fontVariationSettings = `"wght" ${weight}`;
       }
       // Zone 3: 1/3 Width -> Min Width
       else {
           heading3.style.display = "block";
           // Progress: 0 at boundary2, 1 at minWidth
           // current range = [boundary2, minWidth]
           // span = boundary2 - minWidth = range * (1/3)
           let progress = (boundary2 - width) / (range / 6);
           progress = Math.max(0, Math.min(1, progress));
           
           weight = minWeight + progress * (maxWeight - minWeight);
           heading3.style.fontVariationSettings = `"wght" ${weight}`;
       }
   }

   // Run on load and resize
   window.addEventListener("resize", updateHeadings);
   window.addEventListener("load", updateHeadings);


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

      if (maxIndex === 3) {
        hasTriggeredIndex3 = true;
      }

      if (hasTriggeredIndex3 && maxIndex !== 1) {
        maxIndex = 3;
      }

      // =================================================
      // ✅ ➌ Apply _____ when a specific model is detected
      // =================================================
      if (maxIndex === 0) {
        document.querySelector("#mainText1").style.opacity = "0";
        document.querySelector("#mainText2").style.opacity = "0";
        document.body.style.backgroundColor = "#00ff00";
        canShowHeadings = false; // Disable headings
      } 
      else if (maxIndex === 1) {
        document.querySelector("#mainText1").style.opacity = "0";
        document.querySelector("#mainText2").style.opacity = "0";
        document.querySelector("#mainText1").className = "variable2";
        document.querySelector("#mainText2").className = "variable2";
        document.querySelector("#mainText2").textContent = "Friday";
        canShowHeadings = true; // Enable headings
      } 
      else if (maxIndex === 2) {
        document.querySelector("#mainText1").style.opacity = "1";
        document.querySelector("#mainText2").style.opacity = "1";
        document.querySelector("#mainText1").className = "variable1";
        document.querySelector("#mainText2").className = "variable1";
        document.querySelector("#mainText2").textContent = "Welcome";  
        document.body.style.backgroundColor = "#0800ff";
        canShowHeadings = false; // Disable headings
      } 
      else if (maxIndex === 3) {
        document.querySelector("#mainText1").style.opacity = "1";
        document.querySelector("#mainText2").style.opacity = "1";
        document.querySelector("#mainText1").className = "variable2";
        document.querySelector("#mainText2").className = "variable2";
        document.querySelector("#mainText1").textContent = "Tiri Kananuruk is a Thai performance artist and educator based in New York.";
        document.querySelector("#mainText2").textContent = "Performance Artist / Creative Coder / Educator ";  
        canShowHeadings = false; // Disable headings
      } 

      // Trigger updateHeadings to apply changes immediately
      updateHeadings();
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