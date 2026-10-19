# ICS 504 Midterm Lab

An interactive study app for the ICS 504 Machine Learning midterm (German International University in Cairo). It covers Lectures 1 to 5: gradient descent, polynomial regression and regularization, logistic regression, probability, decision trees, and random forests.

Each lecture has four tabs:

- **Learn**: the theory with derivations, plus live labs embedded in the text.
- **Worked examples**: exam-style calculations to try before reading the solution.
- **Summary & recall**: core concepts, formulas, key terms, exam traps, and active-recall prompts.
- **Quiz**: multiple-choice questions with explanations.

Across all lectures there are flashcards, a one-page formula sheet, and a randomised mock exam. Progress is saved in the browser's local storage.

## Running it

Live version: https://ahmedatefyoussef.github.io/ics504-midterm-lab/

To run it locally: it is a static site with no build step. Serve the folder with any static server and open it:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000. Opening `index.html` directly from disk may block the script files in some browsers, so a server is recommended.

## Files

| File | Contents |
|---|---|
| `index.html` | Page shell and all styles (light and dark themes) |
| `app.js` | Routing, lecture pages, quiz engine, flashcards, formula sheet |
| `content-a.js` | Lecture content for L1, L2, L3A |
| `content-b.js` | Lecture content for L3B, L4, L5 |
| `viz-core.js` | Plotting helpers and the L1 and L2 labs |
| `viz-more.js` | Labs for L3A, L3B, L4, L5, including a small CART tree and random forest |

External dependencies load from CDNs at runtime: MathJax 3.2.2 (jsDelivr) for the math, and the Geist and Geist Mono fonts (Google Fonts).

## Credits

Lecture material is based on the ICS 504 course slides by Dr. Caroline Sabty, which in turn build on slides by Dr. Seif Eldawlatly and courses by Prof. Jose Portilla. Icons are from [Phosphor Icons](https://phosphoricons.com).
