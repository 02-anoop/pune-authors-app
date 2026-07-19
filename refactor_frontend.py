import os
import re

src_dir = r"c:\Users\arvin\Desktop\pune-authors-app\src\app\components"
dashboard_path = os.path.join(src_dir, "OperationsDashboardPage.tsx")

with open(dashboard_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract AuthorFullProfileView
start_str = "const AuthorFullProfileView = ({ author, onBack }: { author: any, onBack: () => void }) => {"
start_idx = content.find(start_str)

if start_idx != -1:
    # Find the end of this component. The next function is export function OperationsDashboardPage()
    end_str = "export function OperationsDashboardPage() {"
    end_idx = content.find(end_str)
    
    if end_idx != -1:
        component_code = content[start_idx:end_idx]
        
        # We need imports for this new component
        imports = """import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Check, XCircle } from 'lucide-react';
"""
        
        with open(os.path.join(src_dir, "AuthorFullProfileView.tsx"), "w", encoding="utf-8") as f:
            f.write(imports + "\n" + component_code)
            
        # Replace in main file
        replacement = "import { AuthorFullProfileView } from './AuthorFullProfileView';\n\n"
        new_content = content[:start_idx] + replacement + content[end_idx:]
        
        with open(dashboard_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("AuthorFullProfileView extracted!")
