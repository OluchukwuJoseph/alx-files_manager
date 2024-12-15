import requests
import base64
import sys

url = 'http://localhost:5000/files'
token = sys.argv[1]

headers = {
    'Content-Type': 'application/json',
    'X-Token': token
}
data = {
    'type': 'file',
    'parentId': 0,
}

file_content = []

for i in range(1, 21):
    str_bytes = f'File {i} contents'.encode('ascii')
    encoded_string = base64.b64encode(str_bytes).decode('ascii')
    file_content.append(encoded_string)

for i in range(20):
    data['name'] = f'file_{i + 1}'
    data['data'] = file_content[i]
    response = requests.post(url, json=data, headers=headers)
    print(response.json())
