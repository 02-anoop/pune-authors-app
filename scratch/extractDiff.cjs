const fs = require('fs');

const data = fs.readFileSync('C:/Users/arvin/.gemini/antigravity/brain/4cd1efaf-f43b-4604-85da-627a939fbda8/.system_generated/logs/overview.txt', 'utf8');
const lines = data.split('\n');

for (const line of lines) {
    if (line.includes('cd9bf0bd-3f13-46e7-8ba4-316dc02be7bd') && line.includes('Output delta since last status check')) {
        // This is a log line containing the output
        try {
            const parsed = JSON.parse(line);
            // It might be in parsed.content or similar
            if (parsed.content) {
                fs.writeFileSync('diff.patch', parsed.content);
            }
        } catch (e) {}
    }
}
