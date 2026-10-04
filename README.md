# Yellow Car Game

The premise of the game is very simple. The first person to spot a yellow car earns a point. This
tool uses an AI Oracle to determine whether an image contains a yellow car or not.

## The Oracle

When one player calls a car yellow, another may challenge the call and invoke the Oracle. The
challenge is a risk: if the Oracle upholds the yellow, the challenger loses a point.

The Oracle judges strictly by the Rulebook, defined once as `RULEBOOK` in `oracle.js` and shown in
the app. Every verdict cites the rules that decided it, quoted verbatim from the Rulebook.

## Testing Procedure

Unit tests for the Rulebook and citation handling run offline:

```bash
node --test
```

To verify the Oracle's behavior and ensure it adheres to its laws, a Node.js test script (`test_oracle.js`) is provided. This script runs a suite of images (both yellow and non-yellow) against the live Oracle and reports the results. A verdict that cites no rules fails.

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
*   `oracle.js`: Contains the core AI Oracle logic, including the `RULEBOOK` and the `callOracle` function.
*   `oracle_test.js`: Offline unit tests for the Rulebook and citation handling.
*   `test_oracle.js`: The Node.js script for running automated tests against the live Oracle.
*   `static/`: Directory containing all test images.
*   `logo.png`, `manifest.json`, `sw.js`: Other static assets for the web application.
