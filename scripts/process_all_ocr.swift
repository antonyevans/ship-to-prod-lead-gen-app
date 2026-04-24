import Cocoa
import Vision

let arguments = CommandLine.arguments
guard arguments.count > 2 else {
    print("Usage: swift process_all_ocr.swift <directory> <output_file>")
    exit(1)
}
let directoryPath = arguments[1]
let outputPath = arguments[2]

let fileManager = FileManager.default
guard let enumerator = fileManager.enumerator(atPath: directoryPath) else {
    print("Cannot read directory: \(directoryPath)")
    exit(1)
}

var allText = "# Hackathon Sponsor Slides OCR Output\n\n"

for case let filename as String in enumerator {
    let lower = filename.lowercased()
    guard lower.hasSuffix(".heic") || lower.hasSuffix(".jpg") || lower.hasSuffix(".jpeg") || lower.hasSuffix(".png") else { continue }
    
    let filePath = (directoryPath as NSString).appendingPathComponent(filename)
    guard let image = NSImage(contentsOfFile: filePath),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        allText += "## \(filename)\n*Could not read image.*\n\n"
        continue
    }

    let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    let request = VNRecognizeTextRequest { (request, error) in
        guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
        let text = observations.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
        allText += "## \(filename)\n\(text)\n\n"
    }

    do {
        try requestHandler.perform([request])
    } catch {
        allText += "## \(filename)\n*OCR Error: \(error)*\n\n"
    }
}

do {
    try allText.write(toFile: outputPath, atomically: true, encoding: .utf8)
    print("Wrote OCR output to \(outputPath)")
} catch {
    print("Error writing output file: \(error)")
    exit(1)
}
