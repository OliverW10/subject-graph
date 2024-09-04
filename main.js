import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import circular from "graphology-layout/circular";
import Sigma from "sigma"

let all_subjects = undefined;
async function getSubjects(){
    if (all_subjects) return all_subjects;

    let response = await fetch("./subjects.json");
    let subjects_list = await response.json();
    all_subjects = {}
    for (const s of subjects_list) {
        all_subjects[s.number] = s;
        s["postreqs"] = []
    }
    for (const [num, s] of Object.entries(all_subjects)) {
        for (const prereq of s.prereqs) {
            if (all_subjects.hasOwnProperty(prereq)) {
                const other = all_subjects[prereq];
                if (!other["postreqs"]) {
                }
                other.postreqs.push(s.number)
            } else {
                console.log(`${s.number} has a preq for a subject we dont have ${prereq}`);
            }
        }
    }

    return all_subjects;
}

function getRelativesOf(targetId){
    var related = [subjects[targetId]];
    var seen = new Set();
    seen.add(targetId.toString())

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
}

(async () => {
    var subjects = await getSubjects();
    const subjects_in_comp_sci = ['41173', '42913', '41004', '37233', '41182', '31005', '41052', '31748', '41080', '31256', '41043', '31269', '31261', '41175', '31097', '32011', '31338', '41905', '31777', '31266', '41900', '41076', '31277', '57304', '31282', '33130', '32009', '31257', '31280', '43024', '31260', '41184', '42050', '43030', '41180', '43023', '31016', '41181', '31255', '37262', '31080', '41019', '31263', '41113', '31927', '48433', '31276', '41903', '48436', '31250', '31245', '33116', '31272', '41891', '31243', '41889', '42028', '42037', '31265', '48033', '33230', '41025', '41171', '37161', '41077', '41183', '41001', '48024', '31268', '31247', '31258', '31262', '43025', '31275', '32146', '31251', '41174', '41185', '41890', '31253', '48450', '41021', '48730', '41040', '42036', '37181', '41020', '31271', '41092', '31242', '41039', '41172', '41026', '48270'];

    var to_graph = [];
    if (true){
        for (var subjId of subjects_in_comp_sci) {
            to_graph.push(subjects[subjId]);
        }
    } else {
        // to_graph = getRelativesOf(targetId);
    }

    const graph = new Graph();

    for (const subject of to_graph) {
        graph.addNode(subject.number, { label: subject.name, x: 0, y: 0, size: 5 + subject.postreqs.length * 0.2, color: "blue" });
    }

    for (const subject of to_graph) {
        for (const prereq of subject.prereqs){
            if (subjects_in_comp_sci.indexOf(prereq.toString()) != -1){
                try {
                    graph.addEdge(subject.number, prereq);
                } catch (x) { // UsageGraphError
                    // some subjects have duplicate links in their prerequisites because whoever writes them is bad at logic (see 37262)
                }
            }
        }
    }

    circular.assign(graph);
      const settings = forceAtlas2.inferSettings(graph);
      forceAtlas2.assign(graph, { settings, iterations: 1000 });
    
    // Instantiate sigma.js and render the graph
    const sigmaInstance = new Sigma(graph, document.getElementById("container"));
})();
