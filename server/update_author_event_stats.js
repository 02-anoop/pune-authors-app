const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = `Nitin Kare	9112180934	36	8
Nishit Gupta	8989612031	36	1
Divya Mahadik	9890109096	36	5
Reyanshi Chouhan	9881136863	36	3
Cdr Madhavi	9167071968	36	3
Uma Yogananda	9702005707	36	4
Padma C	9845296389	36	1
Amita Samant	9850906696	36	7
Nima Mankar	9898058825	0	0
Chetna Bhatia	9821321162	36	3
Jasbir Basu	9819720728	36	9
Shivani Sabharwal	9999325599	36	1
Srishti Jain	7744974014	36	3
Vaishali Jog	9673330308	36	13
Rajesh Wattamwar	9422871050	36	1
Nitesh Pandey	9725950593	36	0
Vandana Srivastava	9506030459	36	5
Gautam Mayekar	9158701136	36	0
Deepak Phadnis	9922909009	36	3
Deepti Kolte	8861309072	36	5
Sanjay lazar	9820083418	0	6
Cdr Shiv Mathur	7977097397	36	24
Lakshmi Ajoy	9819477153	36	16
Pratima Kapur	9372866399	36	1
Cmde Sanjay Tewari	9833857188	36	4
Ashwini Sane	7219066362	0	0
Riya Menghani	9665533344	36	2
LtCol Vineet Kumar	9582588116	0	0
Jaishree Laxmikant	9324390808	36	3
Ritu Rawat	9599650155	34	0
Nandini Cardaso	9923106321	34	0
Saroj Salelkar	9823869350	34	0
Bijall Sheth	9821936133	34	0
Diya Santhosh	8050021439	31	0
Dr Vijaylakshmi	8975134040	31	0
Bindu Unnikrishnan	9767029731	31	5
Shefali Arora	9888813400	26	0
Cdr Satish Yadav	7382626845	23	0
Nishita Bhardwaj	9084293824	23	0
Geet Mala Jalota	9819501313	0	8
Gp Capt Srinivasan	9884799228	23	0
Sanjay Koul	9890540890	23	0
Siddharth Sen	9903693997	23	0
Dr Vishwa Ratan	9931012564	23	0
Himani Paranjpe	89833 47596	0	2
Geetanjali Mehra	9021542339	19	3
Madhuri Maitra	9373314498	18	3
Ram Bhat	9552536849	12	1
Nina Apra	8839285647	10	0
Sripata Mahanty	419767283	0	0`;

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Author" ADD COLUMN "aggParticipatedEvents" INTEGER;');
    await prisma.$executeRawUnsafe('ALTER TABLE "Author" ADD COLUMN "aggEligibleEvents" INTEGER;');
    console.log("Added columns successfully.");
  } catch (err) {
    console.log("Columns might already exist.", err.message);
  }

  const lines = data.split('\n');
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 4) {
      const phoneRaw = parts[1].trim().replace(/\s+/g, '');
      const eligible = parseInt(parts[2].trim(), 10) || 0;
      const participated = parseInt(parts[3].trim(), 10) || 0;
      
      try {
        const updateCount = await prisma.$executeRawUnsafe(
          'UPDATE "Author" SET "aggParticipatedEvents" = $1, "aggEligibleEvents" = $2 WHERE "phone" = $3 OR "phone" = $4',
          participated, eligible, phoneRaw, `+91${phoneRaw}`
        );
        console.log(`Updated ${parts[0]} (Phone: ${phoneRaw}): ${updateCount} records`);
      } catch (err) {
        console.error(`Failed to update ${parts[0]}`, err);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
