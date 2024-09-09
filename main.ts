import Graph from "graphology";
import force from "graphology-layout-force";
import forceAtlas2 from "graphology-layout-forceatlas2";
import circular from "graphology-layout/circular";
import Sigma from "sigma"

interface SubjectInfo {
    subject_type: string;
    number: number;
    name: string;
    prereqs: number[];
    area: string;
    postreqs: number[];
    depth: number;
}

let subjectsCache: Map<number, SubjectInfo> | undefined = undefined;
async function getSubjects() : Promise<Map<number, SubjectInfo>> {
    if (subjectsCache) return subjectsCache;

    let response = await fetch("./subjects.json");
    let subjectsList = await response.json() as SubjectInfo[];

    subjectsCache = new Map<number, SubjectInfo>();

    for (const subj of subjectsList) {
        subjectsCache.set(subj.number, subj);
        subj.postreqs = [];
    }

    // maps a subject id to the subjects that have it as a prerequisite
    for (const s of subjectsCache.values()) {
        for (const currentPrereqId of s.prereqs) {
            const other = subjectsCache.get(currentPrereqId);
            if (other == undefined) {
                // console.warn(`Subject ${s.number} had a prereq on ${currentPrereqId} which couldnt be found`);
                continue;
            }
            other.postreqs.push(s.number);
        }
    }
    
    // Get prereq depth for each subject
    for (const s of subjectsCache.values()) {
        setDepth(s, subjectsCache);
    }

    return subjectsCache;
}

function setDepth(subject: SubjectInfo | undefined, all_subjects_dict: Map<number, SubjectInfo>) : number {
    if (subject == undefined || subject.prereqs.length == 0){
        return 0;
    }

    if (subject.depth != undefined) {
        return subject.depth;
    }

    // hack to prevent getting stuck on cycles, gets overwritten with actual value below
    subject.depth = 0;

    const result = Math.max(...subject.prereqs.map(id => setDepth(all_subjects_dict.get(id), all_subjects_dict))) + 1;
    subject.depth = result;
    return result;
}


const renderGraph = async () => {
    var subjects = await getSubjects();
    const subjects_in_comp_sci = ['41173', '42913', '41004', '37233', '41182', '31005', '41052', '31748', '41080', '31256', '41043', '31269', '31261', '41175', '31097', '32011', '31338', '41905', '31777', '31266', '41900', '41076', '31277', '57304', '31282', '33130', '32009', '31257', '31280', '43024', '31260', '41184', '42050', '43030', '41180', '43023', '31016', '41181', '31255', '37262', '31080', '41019', '31263', '41113', '31927', '48433', '31276', '41903', '48436', '31250', '31245', '33116', '31272', '41891', '31243', '41889', '42028', '42037', '31265', '48033', '33230', '41025', '41171', '37161', '41077', '41183', '41001', '48024', '31268', '31247', '31258', '31262', '43025', '31275', '32146', '31251', '41174', '41185', '41890', '31253', '48450', '41021', '48730', '41040', '42036', '37181', '41020', '31271', '41092', '31242', '41039', '41172', '41026', '48270'];
    
    var to_graph: SubjectInfo[] = [];
    
    console.log(`total: ${subjects.size}, comp sci: ${subjects_in_comp_sci.length}`)
    for (var subjId of subjects_in_comp_sci) {
        var currentSubj = subjects.get(parseInt(subjId));
        if (currentSubj == undefined) {
            console.warn(`Subject ${subjId} from degree not found`);
            continue;
        }
        to_graph.push(currentSubj);
    }
    console.log(`valid: ${to_graph.length}`)

    const graph = new Graph();

    for (const subject of to_graph) {
        graph.addNode(subject.number, { label: subject.name, defaultLabelSize: 8, x: 0, y: subject.depth, size: 5 + subject.postreqs.length * 0.2, color: "blue" });
    }

    for (const subject of to_graph) {
        for (const prereq of subject.prereqs){
            try {
                graph.addEdge(subject.number, prereq, { type: "arrow" });
            } catch (x) { // UsageGraphError
                // some subjects have duplicate links in their prerequisites because whoever writes them is bad at logic (e.g. 37262)
            }
        }
    }

    circular.assign(graph);
    const settings = forceAtlas2.inferSettings(graph);
    forceAtlas2.assign(graph, { settings, iterations: 1000 });
    // force.assign(graph, 10);
    
    const graphRenderer = new Sigma(graph, document.getElementById("container")!, { labelSize: 12 });
};

renderGraph();
