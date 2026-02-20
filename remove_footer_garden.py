import sys

file_path = "src/app/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Remove import
import_statement = 'import FooterGarden from "@/components/FooterGarden";\n'
content = content.replace(import_statement, '')

# Remove component from footer
footer_search = '<footer className="bg-[#F3EFE7] border-t border-[rgba(61,61,61,0.08)] relative z-10 overflow-hidden">\n        <FooterGarden />'
footer_replace = '<footer className="bg-[#F3EFE7] border-t border-[rgba(61,61,61,0.08)] relative z-10">'

content = content.replace(footer_search, footer_replace)

with open(file_path, "w") as f:
    f.write(content)

print("Removed FooterGarden from page.tsx")
