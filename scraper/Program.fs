open System.Text.RegularExpressions
// For more information see https://aka.ms/fsharp-console-apps
printfn "Hello from F#"

let getPrereqExpressionForSubject subjectNumber = Ok "(1234 AND 9786)"

type NonEmptyList<'T> = // can use the inbuilt cons list thing?
    | First of 'T
    | Rest of list<'T>

type ExpressionElement = 
    | SubjectId of int
    | And of NonEmptyList<ExpressionElement>
    | Or of NonEmptyList<ExpressionElement>

type Token =
    | OpenBrace
    | CloseBrace
    | SubjectId of int
    | And
    | Or

let allowedChars = "()1234567890"

let filterExpressionCharacters text = String.collect(fun c -> if allowedChars.Contains(c) then c.ToString() else "" )

let getLexeme (chars: char list) = 
    let getLexemeFromStr (text: string) = 
        if text[0] = '(' then Some(OpenBrace)
        elif text[0] = ')' then Some(CloseBrace)
        elif text.StartsWith("or") then Some(Or)
        elif text.StartsWith("and") then Some(And)
        elif Regex.IsMatch(text, "\d{6}") then Some(SubjectId(int(text)))
        else None
    getLexemeFromStr((new string[|for c in chars -> c|]))



// Recusively tokenize the string one character at a time, keeping the context in currentToken
// TODO: make to use tail calls?
let rec tokenize (currentToken: char list, text: string) = 
    match getLexeme(currentToken) with
        | Some(lexeme) -> lexeme :: tokenize(list.Empty, text) // Have finished current lexeme
        | None ->
            if text.Length = 0 then list.Empty // Base case, have finished lexing
            else tokenize(text[0] :: currentToken, text.Substring(1)) // Not yet done current lexeme

let tokenizeFromStr (text: string) =
    Seq.toList(text) |> tokenize list.Empty

// a ll(1) parser to build a 
let parseTokensToTree (text: string) = Ok ()

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