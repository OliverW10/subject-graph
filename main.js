import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import circular from "graphology-layout/circular";
import Sigma from "sigma"

(async () => {
    let response = await fetch("subjects.json");
    let subjects_list = await response.json();
    let subjects = {}
    for (const s of subjects_list) {
        subjects[s.number] = s;
        s["postreqs"] = []
    }
    for (const [num, s] of Object.entries(subjects)) {
        for (const prereq of s.prereqs) {
            if (subjects.hasOwnProperty(prereq)) {
                const other = subjects[prereq];
                if (!other["postreqs"]) {
                }
                other.postreqs.push(s.number)
            } else {
                console.log(`${s.number} has a preq for a subject we dont have ${prereq}`);
            }
        }
    }

    let target = 48024;
    console.log(subjects[target]);

    var related = [subjects[target]];
    var seen = new Set();
    seen.add(target.toString())
    const addPostReqs = (s) => {
        for(var postReqId of s.postreqs){
            if(!seen.has(postReqId)){
                const postReq = subjects[postReqId];
                seen.add(postReqId);
                related.push(postReq);
                addPostReqs(postReq);
            }
        }
    };
    addPostReqs(subjects[target]);
    console.log(related);

    const graph = new Graph();

    for (const subject of related) {
        graph.addNode(subject.number, { label: subject.name, x: 0, y: 0, size: 10, color: "blue" });
    }

    for (const subject of related) {
        for (const prereq of subject.prereqs){
            if (seen.has(prereq.toString())){
                graph.addEdge(subject.number, prereq);
            }
        }
    }

    circular.assign(graph);
      const settings = forceAtlas2.inferSettings(graph);
      forceAtlas2.assign(graph, { settings, iterations: 600 });
    
    // Instantiate sigma.js and render the graph
    const sigmaInstance = new Sigma(graph, document.getElementById("container"));
})();
