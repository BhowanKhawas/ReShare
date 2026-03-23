class About {
    static async getTeamMembers() {
        return [
            { 
                Name: "Bhowan Khawas", 
                role: "Project Management & Testing", 
                Bio: "Bhowan coordinates project milestones and leads the quality assurance phase." 
            },
            { 
                Name: "Aakriti Gurung", 
                role: "Frontend Development", 
                Bio: "Aakriti is responsible for the visual identity of the platform and responsive Pug templates." 
            },
            { 
                Name: "Ismail Sohail", 
                role: "Backend Development", 
                Bio: "Ismail builds the core server-side logic and API routes that power the network's features." 
            },
            
            { 
                Name: "Abdul Rehman", 
                role: "DevOps & CI/CD", 
                Bio: "Abdul manages the infrastructure and deployment pipelines, ensuring application stability." 
            },
            { 
                Name: "Sameer Shabbir", 
                role: "Database Design & Integration", 
                Bio: "Sameer is the architect of our data layer, designing the MySQL schema and integration." 
            }
        ];
    }
}

module.exports = About;
