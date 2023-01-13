Try it out on the [Website](https://vic3calc.com/)

# Victoria 3 Calculator
The idea behind this project is to automatically calculate resource and building requirements for supply chains in [Victoria 3](https://www.paradoxinteractive.com/games/victoria-3/about).

We use HTML, JavaScript and CSS, [Bootstrap](https://getbootstrap.com/), and [Jomini](https://github.com/nickbabcock/jomini) to parse the data.

## Run
To run locally, install npm, navigate to the directory containing index.html and run:
```text
http-server
```
Then head to the specified address (default is http://localhost:8080).

## Future Ideas
Add technologies required for the production methods to the technologies column instead of just listing the technology required for the building itself.

Work on the process of automatically generating supply chains. See script.js:addDependents().
