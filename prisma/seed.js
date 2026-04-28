const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.question.deleteMany({})

  const questions = [
    {
      text: "What is the minimum age as on the qualifying date for registration in the electoral roll?",
      difficulty: "Beginner",
      option1: "16 Years",
      option2: "18 Years",
      option3: "21 Years",
      option4: "25 Years",
      correctOption: 2,
      rationale: "According to the ECI, the minimum age to be eligible to vote is 18 years on the qualifying date."
    },
    {
      text: "Which specific form number is prescribed for the deletion of a name from the electoral roll?",
      difficulty: "Intermediate",
      option1: "Form-6",
      option2: "Form-6A",
      option3: "Form-7",
      option4: "Form-8",
      correctOption: 3,
      rationale: "Form-7 is used for objecting to proposed inclusions or for deleting a name due to death or duplicate entry."
    },
    {
      text: "In the Election Commission of India, apart from the Chief Election Commissioner, how many additional commissioners are there?",
      difficulty: "Advanced",
      option1: "1",
      option2: "2",
      option3: "3",
      option4: "4",
      correctOption: 2,
      rationale: "The ECI currently consists of the Chief Election Commissioner and 2 Election Commissioners."
    },
    {
      text: "Which form is used for New Voters (General Electors) to enroll?",
      difficulty: "Beginner",
      option1: "Form-6",
      option2: "Form-7",
      option3: "Form-8",
      option4: "Form-12",
      correctOption: 1,
      rationale: "Form-6 is the application form for new voters to register."
    },
    {
      text: "How long does the VVPAT slip remain visible behind the transparent window?",
      difficulty: "Intermediate",
      option1: "3 seconds",
      option2: "5 seconds",
      option3: "7 seconds",
      option4: "10 seconds",
      correctOption: 3,
      rationale: "The printed VVPAT slip remains visible behind the transparent window for 7 seconds to allow voter verification."
    }
  ]

  for (const q of questions) {
    await prisma.question.create({ data: q })
  }

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
