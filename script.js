function minimizeDFA() {

    const states = document.getElementById("states").value
        .split(",")
        .map(s => s.trim());

    const alphabet = document.getElementById("alphabet").value
        .split(",")
        .map(s => s.trim());

    const startState = document.getElementById("startState").value.trim();

    const finalStates = document.getElementById("finalStates").value
        .split(",")
        .map(s => s.trim());

    const transitionLines = document.getElementById("transitions").value
        .trim()
        .split("\n");

    const transitionMap = {};

    transitionLines.forEach(line => {

        const [from, symbol, to] = line.split(",").map(x => x.trim());

        if (!transitionMap[from]) {
            transitionMap[from] = {};
        }

        transitionMap[from][symbol] = to;
    });

    let partitions = [
        finalStates,
        states.filter(s => !finalStates.includes(s))
    ];

    let changed = true;

    while (changed) {

        changed = false;

        let newPartitions = [];

        for (let group of partitions) {

            let splitter = {};

            for (let state of group) {

                let signature = alphabet.map(symbol => {

                    const nextState = transitionMap[state][symbol];

                    return partitions.findIndex(
                        p => p.includes(nextState)
                    );

                }).join(",");

                if (!splitter[signature]) {
                    splitter[signature] = [];
                }

                splitter[signature].push(state);
            }

            const splitGroups = Object.values(splitter);

            newPartitions.push(...splitGroups);

            if (splitGroups.length > 1) {
                changed = true;
            }
        }

        partitions = newPartitions;
    }

    const minimizedStates = partitions.map((group, index) => ({
        name: "M" + index,
        states: group
    }));

    let minimizedTransitions = [];

    minimizedStates.forEach(groupObj => {

        const representative = groupObj.states[0];

        alphabet.forEach(symbol => {

            const nextState =
                transitionMap[representative][symbol];

            const targetGroup = minimizedStates.find(
                g => g.states.includes(nextState)
            );

            minimizedTransitions.push({
                from: groupObj.name,
                symbol: symbol,
                to: targetGroup.name
            });

        });

    });

    const minimizedStart = minimizedStates.find(
        g => g.states.includes(startState)
    ).name;

    const minimizedFinal = minimizedStates
        .filter(g =>
            g.states.some(s => finalStates.includes(s))
        )
        .map(g => g.name);

    displayResult(
        minimizedStates,
        minimizedTransitions,
        minimizedStart,
        minimizedFinal
    );
}

function displayResult(
    states,
    transitions,
    start,
    finals
) {

    let html = `
        <div class="result">

            <h2>Minimized DFA</h2>

            <h3>Equivalent State Groups</h3>
    `;

    states.forEach(g => {

        html += `
            <p>
                <b>${g.name}</b>
                = { ${g.states.join(", ")} }
            </p>
        `;
    });

    html += `
        <h3>Start State</h3>
        <p>${start}</p>

        <h3>Final States</h3>
        <p>${finals.join(", ")}</p>

        <h3>Transitions</h3>

        <table>

            <tr>
                <th>From</th>
                <th>Input</th>
                <th>To</th>
            </tr>
    `;

    transitions.forEach(t => {

        html += `
            <tr>
                <td>${t.from}</td>
                <td>${t.symbol}</td>
                <td>${t.to}</td>
            </tr>
        `;
    });

    html += `
        </table>
        </div>
    `;

    document.getElementById("output").innerHTML = html;
}