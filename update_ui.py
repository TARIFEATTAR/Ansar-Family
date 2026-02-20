import sys
import re

file_path = "src/app/page.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Floating Header
content = content.replace(
    'className="fixed top-0 left-0 right-0 z-50 px-6 md:px-8 py-4 bg-ansar-cream/90 backdrop-blur-md border-b border-[rgba(61,61,61,0.06)]"',
    'className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 max-w-[1200px] mx-auto px-6 md:px-8 py-3 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_-8px_rgba(61,61,61,0.08)] rounded-full"'
)

# 2. Hero Cards (Seeker & Volunteer) Desktop
content = content.replace(
    'p-6 rounded-[20px] border border-white/60 shadow-[0_2px_16px_-4px_rgba(61,61,61,0.05)] group-hover:shadow-[0_16px_32px_-8px_rgba(61,61,61,0.1)] group-hover:bg-white/65 group-hover:border-white/80 transition-all duration-300 relative overflow-hidden',
    'p-7 rounded-[32px] border border-white/80 shadow-[0_8px_32px_-8px_rgba(61,61,61,0.06)] group-hover:shadow-[0_24px_48px_-12px_rgba(61,61,61,0.1)] group-hover:bg-white/80 group-hover:border-white transition-all duration-400 relative overflow-hidden backdrop-blur-2xl'
)

# 3. Hero Cards (Mobile)
content = content.replace(
    'p-4 rounded-2xl border border-white/60 shadow-[0_2px_12px_-4px_rgba(61,61,61,0.06)] active:scale-[0.97] transition-all duration-200 relative overflow-hidden aspect-square flex flex-col justify-between',
    'p-5 rounded-[24px] border border-white/80 shadow-[0_8px_24px_-6px_rgba(61,61,61,0.06)] active:scale-[0.97] transition-all duration-300 relative overflow-hidden aspect-square flex flex-col justify-between bg-white/70 backdrop-blur-2xl'
)

# 4. The Garden Cards
content = content.replace(
    'rounded-2xl bg-ansar-terracotta-50/40 border border-ansar-terracotta-100/30 overflow-hidden',
    'rounded-[32px] bg-gradient-to-b from-ansar-terracotta-50/60 to-white/80 border border-white shadow-[0_8px_24px_-8px_rgba(61,61,61,0.04)] overflow-hidden hover:shadow-[0_16px_32px_-12px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400'
)
content = content.replace(
    'p-6 md:p-8 rounded-2xl bg-ansar-sage-50/40 border border-ansar-sage-100/30',
    'p-6 md:p-8 rounded-[32px] bg-gradient-to-b from-ansar-sage-50/60 to-white/80 border border-white shadow-[0_8px_24px_-8px_rgba(61,61,61,0.04)] hover:shadow-[0_16px_32px_-12px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400'
)
content = content.replace(
    'p-6 md:p-8 rounded-2xl bg-ansar-ochre-50/40 border border-ansar-ochre-100/30',
    'p-6 md:p-8 rounded-[32px] bg-gradient-to-b from-ansar-ochre-50/60 to-white/80 border border-white shadow-[0_8px_24px_-8px_rgba(61,61,61,0.04)] hover:shadow-[0_16px_32px_-12px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400'
)

# 5. How It Works Cards
content = content.replace(
    'bg-white p-6 rounded-xl shadow-sm border border-ansar-sage-100 flex flex-col items-center text-center',
    'bg-white p-8 rounded-[32px] shadow-[0_8px_32px_-12px_rgba(61,61,61,0.06)] border border-white flex flex-col items-center text-center hover:shadow-[0_16px_40px_-16px_rgba(61,61,61,0.1)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group'
)
content = content.replace(
    'w-12 h-12 bg-ansar-sage-100 rounded-full flex items-center justify-center mb-4 text-ansar-sage-600',
    'w-16 h-16 bg-ansar-sage-50 border border-ansar-sage-100/50 rounded-[24px] flex items-center justify-center mb-6 text-ansar-sage-600 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500'
)
content = content.replace(
    'span className="font-body text-xs text-ansar-sage-600 uppercase tracking-wider mb-2" Within Minutes',
    'span className="font-body text-[10px] font-bold text-ansar-sage-600 uppercase tracking-widest mb-3 bg-ansar-sage-50 px-3 py-1 rounded-full" Within Minutes'
)

# 6. For Communities Cards
content = content.replace(
    'bg-ansar-cream p-8 rounded-xl border border-ansar-sage-100',
    'bg-gradient-to-br from-[#FAF9F5] to-white p-8 rounded-[32px] border border-white shadow-[0_8px_24px_-12px_rgba(61,61,61,0.05)] hover:shadow-[0_20px_40px_-16px_rgba(61,61,61,0.08)] hover:-translate-y-1 transition-all duration-400 relative overflow-hidden group'
)
content = content.replace(
    'w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 text-ansar-terracotta-600 shadow-sm',
    'w-14 h-14 bg-white rounded-[20px] flex items-center justify-center mb-6 text-ansar-terracotta-600 shadow-md border border-ansar-terracotta-50/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500'
)

# 7. Who Its For Icons
content = content.replace(
    'w-16 h-16 bg-ansar-sage-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300',
    'w-16 h-16 bg-gradient-to-br from-ansar-sage-50 to-ansar-sage-100/80 shadow-inner border border-ansar-sage-200/40 rounded-[24px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_8px_24px_-8px_rgba(141,162,144,0.3)]'
)
content = content.replace(
    'w-16 h-16 bg-ansar-terracotta-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300',
    'w-16 h-16 bg-gradient-to-br from-ansar-terracotta-50 to-ansar-terracotta-100/80 shadow-inner border border-ansar-terracotta-200/40 rounded-[24px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_8px_24px_-8px_rgba(202,104,83,0.3)]'
)
content = content.replace(
    'w-16 h-16 bg-ansar-ochre-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300',
    'w-16 h-16 bg-gradient-to-br from-ansar-ochre-50 to-ansar-ochre-100/80 shadow-inner border border-ansar-ochre-200/40 rounded-[24px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_8px_24px_-8px_rgba(212,163,115,0.3)]'
)

# 8. Final CTA Buttons
content = content.replace(
    'className="btn-secondary min-w-[200px] shadow-lg shadow-ansar-terracotta-500/20"',
    'className="bg-ansar-terracotta-600 text-white hover:bg-ansar-terracotta-700 min-w-[220px] rounded-full shadow-[0_8px_20px_-6px_rgba(202,104,83,0.4)] hover:shadow-[0_16px_32px_-10px_rgba(202,104,83,0.5)] transition-all duration-300 py-4 px-8 text-base font-medium flex items-center justify-center hover:-translate-y-1"'
)
content = content.replace(
    'className="btn-outline min-w-[200px]"',
    'className="bg-white text-ansar-charcoal border border-ansar-gray/20 hover:border-ansar-charcoal hover:bg-ansar-charcoal hover:text-white min-w-[220px] rounded-full shadow-sm hover:shadow-[0_12px_24px_-8px_rgba(61,61,61,0.15)] transition-all duration-300 py-4 px-8 text-base font-medium flex items-center justify-center hover:-translate-y-1"'
)

# Header Button
content = content.replace(
    'inline-flex items-center py-2 px-4 text-xs font-medium rounded-lg border border-ansar-sage-200 text-ansar-sage-700 bg-transparent hover:bg-ansar-sage-600 hover:text-white hover:border-ansar-sage-600 transition-all duration-300',
    'inline-flex items-center py-2.5 px-5 text-xs font-semibold rounded-full border border-ansar-sage-200/60 text-ansar-sage-700 bg-ansar-sage-50 hover:bg-ansar-sage-600 hover:text-white hover:border-ansar-sage-600 hover:shadow-md transition-all duration-300'
)

# Fix 'How it works' pill labels
content = re.sub(
    r'<span className="font-body text-xs text-ansar-sage-600 uppercase tracking-wider mb-2">(.*?)</span>',
    r'<span className="font-body text-[10.5px] font-bold text-ansar-sage-600 uppercase tracking-widest mb-4 bg-ansar-sage-50/80 px-3.5 py-1.5 rounded-full">\1</span>',
    content
)

with open(file_path, "w") as f:
    f.write(content)

print("Updated page.tsx with Google 3.0 / Material You styling")
