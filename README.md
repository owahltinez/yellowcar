# Yellow Car Game

The premise of the game is very simple. The first person to spot a yellow car earns a point. This
tool uses an AI Oracle to determine whether an image contains a yellow car or not.

## AI Oracle - Laws and Guidelines

The AI Oracle has been meticulously trained and provided with strict laws and guidelines to accurately identify a "Yellow Car". These rules are critical for distinguishing true yellow from its many deceivers and include considerations for metallic and pastel variants, as well as clear definitions for non-yellow impostors.

### Core Rules:
*   The color must be predominantly yellow.
*   Metallic yellows (like Austin Yellow, Solarbeam Yellow) ARE acceptable, even if they shimmer like gold.
*   Pastel yellows (like Vanilla Yellow) ARE acceptable, but must still be clearly YELLOW, not Beige.
*   Cream, Beige, Bone, Sand, and Champagne are NOT yellow. They are off-white or light brown.
*   However, actual Gold, Bronze, Copper, and dark Amber are impostors.
*   Greenish variants (Lime, Acid Green, Chartreuse) are NOT yellow.
*   At least 50% of the cab must be yellow, excluding anything being towed.
*   The vehicle must have at least 4 wheels and be legally road-worthy.
*   The vehicle must be a car.

### HEX Color Concepts (as a guide for the AI):
These concepts are used to guide the AI's understanding of color distinctions. The AI does not calculate exact pixels but applies these conceptual boundaries.

*   **ACCEPTABLE YELLOWS:** High Saturation or clear Yellow Hue.
    *   Examples: Lemon (`#FFF700`), Canary (`#FFEF00`), Pastel/Vanilla Yellow (`#FDFD96`, `#F3E5AB`), Metallic Yellow (`#D4AF37` - closer to yellow than brown).

*   **IMPOSTORS (NOT YELLOW):**
    *   **Cream / Off-White:** Very pale, lacking yellow hue.
        *   Examples: Cream (`#FFFDD0`), Bone (`#E3DAC9`).
    *   **Beige / Sand:** Brownish undertone.
        *   Examples: Beige (`#F5F5DC`), Khaki (`#C3B091`).
    *   **Gold / Bronze:** Darker, brownish, low saturation.
    *   **Lime:** Too much green.

## Testing Procedure

To verify the Oracle's behavior and ensure it adheres to its laws, a Node.js test script (`test_oracle.js`) is provided. This script runs a suite of images (both yellow and non-yellow) against the Oracle and reports the results.

### Prerequisites
*   Node.js (LTS version recommended)
*   `npm` or `yarn` (for package management if needed, though direct `node` command will work).

### Running the Tests
1.  Ensure all test images are present in the `./static/` directory.
2.  Open your terminal in the project's root directory.
3.  Execute the test script using Node.js:
    ```bash
    node test_oracle.js
    ```

The script will output the results for each test case, indicating whether it passed or failed, the Oracle's answer, and its reasoning. A summary of passed tests will be provided at the end.

## Project Structure

*   `index.html`: The main game interface.
*   `oracle.js`: Contains the core AI Oracle logic, including the rules and the `callOracle` function.
*   `test_oracle.js`: The Node.js script for running automated tests against the Oracle.
*   `static/`: Directory containing all test images.
*   `logo.png`, `manifest.json`, `sw.js`: Other static assets for the web application.
