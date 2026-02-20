import sys

file_path = "src/app/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add import
import_statement = 'import FooterGarden from "@/components/FooterGarden";\n'
if import_statement not in content:
    content = content.replace(
        'import GardenAnimation from "@/components/GardenAnimation";',
        'import GardenAnimation from "@/components/GardenAnimation";\nimport FooterGarden from "@/components/FooterGarden";'
    )

# Add component to footer
footer_search = '<footer className="bg-[#F3EFE7] border-t border-[rgba(61,61,61,0.08)] relative z-10">'
footer_replace = '<footer className="bg-[#F3EFE7] border-t border-[rgba(61,61,61,0.08)] relative z-10 overflow-hidden">\n        <FooterGarden />'

content = content.replace(footer_search, footer_replace)

with open(file_path, "w") as f:
    f.write(content)

print("Updated page.tsx with FooterGarden")
