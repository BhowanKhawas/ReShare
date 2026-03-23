class About {
    static async getTeamMembers() {
        return [
            { 
                name: "Bhowan Khawas", 
                role: "Project Management & Testing", 
                bio: "Bhowan coordinates project milestones and leads the quality assurance phase." 
            },
            { 
                name: "Aakriti Gurung", 
                role: "Frontend Development", 
                bio: "Aakriti is responsible for the visual identity of the platform and responsive Pug templates." 
            },
            { 
                name: "Ismail Sohail", 
                role: "Backend Development", 
                bio: "Ismail builds the core server-side logic and API routes that power the network's features." 
            },
            
            { 
                name: "Abdul Rehman", 
                role: "DevOps & CI/CD", 
                bio: "Abdul manages the infrastructure and deployment pipelines, ensuring application stability." 
            },
            { 
                name: "Sameer Shabbir", 
                role: "Database Design & Integration", 
                bio: "Sameer is the architect of our data layer, designing the MySQL schema and integration." 
            }
        ];
    }
}

module.exports = About;