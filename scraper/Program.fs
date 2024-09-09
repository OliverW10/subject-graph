// For more information see https://aka.ms/fsharp-console-apps
printfn "Hello from F#"

let getPrereqExpressionForSubject subjectNumber = "1234 AND 9786"

type ExpressionElement = 
    | SubjectId of int
    | OpenScope
    | CloseScope
    | And
    | Or

let parseExpression text = [ OpenScope; SubjectId(1234) ]

type TruthRow = {
    inputs: bool[]
    result: bool
}

type TruthTable = {
    rows: seq<TruthRow>
}

let calculateTruthTable expression = { TruthTable.rows = Seq.empty }

type Prerequisite = 
    | Required of subjectNumber: int
    | Optioanl of subjectNumber: int * alsoRequired: Option<Prerequisite>

let getPrereqs truthTable = seq { Prerequisite.Required }

let getPrereqsForSubject subjectNumber =
    subjectNumber
    |> getPrereqExpressionForSubject
    |> parseExpression
    |> calculateTruthTable
    |> getPrereqs