const fs = require('fs');
const file = 'src/features/widgets/BandsintownWidgetContainer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(`import type { BandsintownEvent } from '@/components/widgets/BandsintownWidget'
  offers: Array<{
    type: string
    url: string
    status: string
  }>
}`, "import type { BandsintownEvent } from '@/components/widgets/BandsintownWidget'");

fs.writeFileSync(file, content);
