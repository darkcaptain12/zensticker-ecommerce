import { prisma } from '@/lib/prisma'

export async function DynamicStyles() {
  const settings = await prisma.siteSettings.findFirst()

  if (!settings) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        :root {
          --primary-color: ${settings.primaryColor};
          --secondary-color: ${settings.secondaryColor};
        }
        .bg-primary {
          background-color: ${settings.primaryColor} !important;
        }
        .text-primary {
          color: ${settings.primaryColor} !important;
        }
        .border-primary {
          border-color: ${settings.primaryColor} !important;
        }
        .text-primary-foreground {
          color: ${settings.secondaryColor} !important;
        }
      `,
      }}
    />
  )
}

