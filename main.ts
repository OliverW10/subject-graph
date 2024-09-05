import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import circular from "graphology-layout/circular";
import Sigma from "sigma"

interface SubjectInfoDTO {
    subject_type: string;
    number: number;
    name: string;
    prereqs: number[];
    area: string;
}

interface SubjectInfoFilled extends SubjectInfoDTO {
    postreqs: number[];
    depth: number;
}

let subjectsCache: { [id: number] : SubjectInfoFilled } | undefined = undefined;
async function getSubjects() : Promise<{ [id: number] : SubjectInfoFilled }> {
    if (subjectsCache) return subjectsCache;

    let response = await fetch("./subjects.json");
    let subjectsList = await response.json() as SubjectInfoDTO[];

    // create "dict" to allow quick access to unfilled subject info's
    let subjectsDtos = new Map<Number, SubjectInfoDTO>();
    for (const dto of subjectsList) {
        subjectsDtos[dto.number] = dto;
    }

    // maps a subject id to the subjects that have it as a prerequisite
    let all_postreqs = new Map<Number, Number[]>();
    for (const s of Object.values(subjectsDtos)) {
        for (const currentPrereqId of s.prereqs) {
            const other = all_postreqs[currentPrereqId];
            if (!other) {
                all_postreqs[currentPrereqId] = [];
            }
            all_postreqs[currentPrereqId].push(s.number);
        }
    }
    
    // Get prereq depth for each subject
    let depths: { [ id: number]: number } = {};
    for (const s of Object.values(subjectsDtos)) {
        depths[s.number] = getDepth(s, subjectsDtos, depths);
    }
    
    subjectsCache = {};
    for (const dto of Object.values(subjectsDtos)) {
        const filled: SubjectInfoFilled = {
            ...dto,
            postreqs: all_postreqs[dto.number],
            depth: depths[dto.number],
        }
        subjectsCache[dto.number] = filled;
    }

    return subjectsCache;
}

function getDepth(subject, all_subjects_dict, depths){
    if (subject.prereqs.length == 0){
        return 0;
    }

    if (depths[subject.number] != undefined) {
        return depths[subject.number];
    }

    return Math.max(...[subject.prereqs.map(id => getDepth(all_subjects_dict[id], all_subjects_dict, depths))]) + 1;
}


const renderGraph = async () => {
    var subjects = await getSubjects();
    const subjects_in_comp_sci = ['41173', '42913', '41004', '37233', '41182', '31005', '41052', '31748', '41080', '31256', '41043', '31269', '31261', '41175', '31097', '32011', '31338', '41905', '31777', '31266', '41900', '41076', '31277', '57304', '31282', '33130', '32009', '31257', '31280', '43024', '31260', '41184', '42050', '43030', '41180', '43023', '31016', '41181', '31255', '37262', '31080', '41019', '31263', '41113', '31927', '48433', '31276', '41903', '48436', '31250', '31245', '33116', '31272', '41891', '31243', '41889', '42028', '42037', '31265', '48033', '33230', '41025', '41171', '37161', '41077', '41183', '41001', '48024', '31268', '31247', '31258', '31262', '43025', '31275', '32146', '31251', '41174', '41185', '41890', '31253', '48450', '41021', '48730', '41040', '42036', '37181', '41020', '31271', '41092', '31242', '41039', '41172', '41026', '48270'];

    var to_graph: SubjectInfoFilled[] = [];

    for (var subjId of subjects_in_comp_sci) {
        to_graph.push(subjects[parseInt(subjId)]);
    }

    const graph = new Graph();

    for (const subject of to_graph) {
        try{
            graph.addNode(subject.number, { label: subject.name, defaultLabelSize: 8, x: 0, y: subject.depth, size: 5 + subject.postreqs.length * 0.2, color: "blue" });
        } catch {
        }
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
    
    const graphRenderer = new Sigma(graph, document.getElementById("container")!, { labelSize: 12 });
};

renderGraph();
