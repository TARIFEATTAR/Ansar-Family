import sys

file_path = "src/components/FooterGarden.tsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace('const drawStem = {', 'import { Variants } from "framer-motion";\n\n  const drawStem: any = {')
content = content.replace('const scaleUp = {', 'const scaleUp: any = {')
content = content.replace('const flowerBloom = {', 'const flowerBloom: any = {')

with open(file_path, "w") as f:
    f.write(content)

print("Fixed TS errors")
