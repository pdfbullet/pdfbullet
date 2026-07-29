export interface ToolApiMetadata {
    id: string;
    name: string;
    endpoint: string;
    sampleFile: string;
    mimeType: string;
    outputFile: string;
    description: string;
}

export const API_TOOLS_LIST: ToolApiMetadata[] = [
    { id: 'all', name: 'All Tools (Full Access API Key)', endpoint: 'All /api/* Endpoints', sampleFile: 'document.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', outputFile: 'output.pdf', description: 'Full access to all PDF, Image, and Document processing APIs' },
    { id: 'word-to-pdf', name: 'Word to PDF', endpoint: '/api/convert-word', sampleFile: 'contract.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', outputFile: 'contract.pdf', description: 'Convert Word DOC / DOCX files to PDF using native server-side engine' },
    { id: 'powerpoint-to-pdf', name: 'PowerPoint to PDF', endpoint: '/api/convert-ppt', sampleFile: 'presentation.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', outputFile: 'presentation.pdf', description: 'Convert PPT / PPTX presentations to PDF' },
    { id: 'excel-to-pdf', name: 'Excel to PDF', endpoint: '/api/convert-excel', sampleFile: 'spreadsheet.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', outputFile: 'spreadsheet.pdf', description: 'Convert Excel XLS / XLSX workbooks to PDF with page auto-fitting' },
    { id: 'merge-pdf', name: 'Merge PDF', endpoint: '/api/merge-pdf', sampleFile: 'document1.pdf', mimeType: 'application/pdf', outputFile: 'merged.pdf', description: 'Combine multiple PDF documents into a single PDF file' },
    { id: 'split-pdf', name: 'Split PDF', endpoint: '/api/split-pdf', sampleFile: 'input.pdf', mimeType: 'application/pdf', outputFile: 'split_pages.zip', description: 'Split PDF into individual pages or page ranges' },
    { id: 'compress-pdf', name: 'Compress PDF', endpoint: '/api/compress-pdf', sampleFile: 'large_document.pdf', mimeType: 'application/pdf', outputFile: 'compressed.pdf', description: 'Reduce PDF file size while optimizing visual quality' },
    { id: 'pdf-to-jpg', name: 'PDF to JPG', endpoint: '/api/pdf-to-jpg', sampleFile: 'input.pdf', mimeType: 'application/pdf', outputFile: 'images.zip', description: 'Convert PDF pages into high-resolution JPG images' },
    { id: 'ocr-pdf', name: 'OCR PDF', endpoint: '/api/ocr-pdf', sampleFile: 'scanned_doc.pdf', mimeType: 'application/pdf', outputFile: 'searchable_ocr.pdf', description: 'Optical Character Recognition to convert scanned PDFs into searchable documents' },
    { id: 'remove-background', name: 'Remove Background', endpoint: '/api/remove-background', sampleFile: 'photo.jpg', mimeType: 'image/jpeg', outputFile: 'no_bg.png', description: 'AI background removal from images' },
    { id: 'ai-image-generator', name: 'AI Image Generator', endpoint: '/api/generate-image', sampleFile: 'prompt.json', mimeType: 'application/json', outputFile: 'generated_image.png', description: 'Generate AI art and images using high-performance model API' },
];

export function getApiCodeSnippet(lang: 'curl' | 'node' | 'python' | 'php' | 'go', apiKey: string, toolId: string = 'word-to-pdf'): string {
    const key = apiKey || 'pdfbullet_live_sec_your_api_key_here';
    const tool = API_TOOLS_LIST.find(t => t.id === toolId) || API_TOOLS_LIST[1];
    const baseUrl = 'https://pdfbullet.com';
    const renderedEndpoint = tool.id === 'all' ? '/api/convert-word' : tool.endpoint;

    if (lang === 'curl') {
        return `# Official ${tool.name} REST API Call
curl -X POST ${baseUrl}${renderedEndpoint} \\
  -H "Authorization: Bearer ${key}" \\
  -F "file=@/path/to/${tool.sampleFile}" \\
  --output ${tool.outputFile}`;
    }

    if (lang === 'node') {
        return `const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Official ${tool.name} Integration
async function process${tool.name.replace(/[^a-zA-Z]/g, '')}(inputPath, outputPath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(inputPath));

  const response = await fetch('${baseUrl}${renderedEndpoint}', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${key}',
      ...form.getHeaders()
    },
    body: form
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('API Request failed: ' + response.status + ' - ' + errorText);
  }

  const fileStream = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on('error', reject);
    fileStream.on('finish', resolve);
  });

  console.log('✅ ${tool.name} processing succeeded:', outputPath);
}

// Execute ${tool.name} call
process${tool.name.replace(/[^a-zA-Z]/g, '')}('./${tool.sampleFile}', './${tool.outputFile}');`;
    }

    if (lang === 'python') {
        return `import requests

# Official ${tool.name} Python Script
API_KEY = "${key}"
ENDPOINT = "${baseUrl}${renderedEndpoint}"

def run_${tool.id.replace(/-/g, '_')}(input_file_path, output_file_path):
    headers = {
        "Authorization": f"Bearer {API_KEY}"
    }
    
    with open(input_file_path, "rb") as file_data:
        files = {"file": ("${tool.sampleFile}", file_data, "${tool.mimeType}")}
        response = requests.post(ENDPOINT, headers=headers, files=files)
        
    if response.status_code == 200:
        with open(output_file_path, "wb") as f:
            f.write(response.content)
        print(f"✅ Successfully completed ${tool.name}: {output_file_path}")
    else:
        print(f"❌ API Error {response.status_code}: {response.text}")

# Run ${tool.name}
run_${tool.id.replace(/-/g, '_')}("${tool.sampleFile}", "${tool.outputFile}")`;
    }

    if (lang === 'php') {
        return `<?php
// Official ${tool.name} PHP cURL Script
$apiKey = "${key}";
$apiUrl = "${baseUrl}${renderedEndpoint}";
$filePath = __DIR__ . "/${tool.sampleFile}";
$outputPath = __DIR__ . "/${tool.outputFile}";

$ch = curl_init();
$file = new CURLFile($filePath, '${tool.mimeType}', '${tool.sampleFile}');

curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer " . $apiKey
    ],
    CURLOPT_POSTFIELDS => [
        "file" => $file
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    file_put_contents($outputPath, $response);
    echo "✅ ${tool.name} succeeded: " . $outputPath;
} else {
    echo "❌ ${tool.name} failed with HTTP Code: " . $httpCode;
}
?>`;
    }

    if (lang === 'go') {
        return `package main

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

// Official ${tool.name} Go Integration
func main() {
	apiKey := "${key}"
	url := "${baseUrl}${renderedEndpoint}"

	file, err := os.Open("${tool.sampleFile}")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", "${tool.sampleFile}")
	if err != nil {
		panic(err)
	}
	io.Copy(part, file)
	writer.Close()

	req, _ := http.NewRequest("POST", url, body)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	out, _ := os.Create("${tool.outputFile}")
	defer out.Close()
	io.Copy(out, resp.Body)
	fmt.Println("✅ Saved output file from ${tool.name}!")
}`;
    }

    return '';
}
