import Cocoa
import Vision

let arguments = CommandLine.arguments
guard arguments.count > 1 else { exit(1) }
let imagePath = arguments[1]

guard let image = NSImage(contentsOfFile: imagePath),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("Cannot read image: \(imagePath)", to: &varStdErr)
    exit(1)
}

var stdErr = FileHandle.standardError
struct StandardErrorOutputStream: TextOutputStream {
    mutating func write(_ string: String) { fputs(string, stderr) }
}
var varStdErr = StandardErrorOutputStream()

let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
let request = VNRecognizeTextRequest { (request, error) in
    guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
    let text = observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
    print(text)
}

do {
    try requestHandler.perform([request])
} catch {
    print("Error: \(error)", to: &varStdErr)
}
