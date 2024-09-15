// For more information see https://aka.ms/fsharp-console-apps
printfn "Hello from F#"

let getPrereqExpressionForSubject subjectNumber = Ok "(1234 AND 9786)"

type NonEmptyList<'T> = 
    | First of 'T
    | Rest of list<'T>

type ExpressionElement = 
    | SubjectId of int
    | And of NonEmptyList<ExpressionElement>
    | Or of NonEmptyList<ExpressionElement>

let allowedChars = "()1234567890"

let parseExpression (text: string) = Ok (String.collect(fun c -> if allowedChars.Contains(c) then c else '' ))

type TruthRow = {
    inputs: bool[]
    result: bool
}

type TruthTable = {
    rows: seq<TruthRow>
}

let calculateTruthTable (expression: ExpressionElement) = Ok { TruthTable.rows = Seq.empty }

type Prerequisite = 
    | Required of subjectNumber: int
    | Optioanl of subjectNumber: int * alsoRequired: Option<Prerequisite>

let getPrereqs (truthTable: TruthTable) = Ok [ Prerequisite.Required ]

let getPrereqsForSubject subjectNumber =
    subjectNumber
    |> getPrereqExpressionForSubject
    |> Result.bind parseExpression
    |> Result.bind calculateTruthTable
    |> Result.bind getPrereqs
    |> fun result ->
        match result with 
        | Ok prereqs -> printfn String.concat(", ", prereqs.map(fun p -> p.ToString()))
        | Error errMsg -> printfn errMsg