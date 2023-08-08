const assert = require('chai').assert;
const request = require('supertest');
const app = require('./test'); // Path to your main app file

describe('Lecturer Rating Platform', function () {
    it('users should input lecturer\'s first name', function (done) {
        request(app)
            .post('/rate')
            .send({
                lastName: 'Smith',
                rating: 9,
                comment: 'Great lecturer!'
            })
            .expect(400) // Expect a bad request due to missing first name
            .expect(res => {
                assert.include(res.text, 'Please enter lecturer\'s first name', 'Should display missing first name message');
            })
            .end(done);
    });

    it('users should include lecturer\'s last name', function (done) {
        request(app)
            .post('/rate')
            .send({
                firstName: 'John',
                rating: 8,
                comment: 'Good lectures'
            })
            .expect(400) // Expect a bad request due to missing last name
            .expect(res => {
                assert.include(res.text, 'Please enter lecturer\'s last name', 'Should display missing last name message');
            })
            .end(done);
    });

    it('users should input a rating between 0 and 10', function (done) {
        request(app)
            .post('/rate')
            .send({
                firstName: 'Alice',
                lastName: 'Johnson',
                rating: 15,
                comment: 'Could be better'
            })
            .expect(400) // Expect a bad request due to invalid rating value
            .expect(res => {
                assert.include(res.text, 'Please enter a rating between 0 and 10', 'Should display invalid rating message');
            })
            .end(done);
    });

    it('a comment should be optional and required', function (done) {
        request(app)
            .post('/rate')
            .send({
                firstName: 'Michael',
                lastName: 'Williams',
                rating: 7
            })
            .expect(302) // Expect a redirect (successful rating submission)
            .end(done);
    });

    it('the rate button should render the output on the reports page', function (done) {
        request(app)
            .post('/rate')
            .send({
                firstName: 'Sarah',
                lastName: 'Miller',
                rating: 8,
                comment: 'Good teaching skills'
            })
            .expect(302) // Expect a redirect (successful rating submission)
            .end(function (err, res) {
                if (err) return done(err);

                request(app)
                    .get('/reports')
                    .expect(200) // Expect the reports page
                    .expect(res => {
                        assert.include(res.text, 'Sarah Miller', 'Reports should contain the lecturer name');
                        assert.include(res.text, '8', 'Reports should contain the rating');
                        assert.include(res.text, 'Good teaching skills', 'Reports should contain the comment');
                    })
                    .end(done);
            });
    });

    it('the view reports button should show lecturer rating reports', function (done) {
        request(app)
            .get('/reports')
            .expect(200) // Expect the reports page
            .end(done);
    });

    it('the total ratings count should update and calculate average rating', function (done) {
        // Prepare the ratings.json file with initial data
        const initialRatings = [
            {
                firstName: 'John',
                lastName: 'Doe',
                rating: 8,
                comment: 'Good lectures'
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                rating: 7,
                comment: 'Helpful'
            }
        ];
        fs.writeFileSync(
            path.join(__dirname, 'ratings.json'),
            JSON.stringify(initialRatings)
        );

        // Make a new rating submission
        request(app)
            .post('/rate')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                rating: 9,
                comment: 'Excellent!'
            })
            .expect(302) // Expect a redirect (successful rating submission)
            .end(function (err, res) {
                if (err) return done(err);

                // Fetch reports page and check if it's updated
                request(app)
                    .get('/reports')
                    .expect(200) // Expect the reports page
                    .expect(res => {
                        assert.include(res.text, 'John Doe', 'Reports should contain the lecturer name');
                        assert.include(res.text, '8.67', 'Reports should contain the updated average rating');
                        assert.include(res.text, '3', 'Reports should contain the updated ratings count');
                    })
                    .end(done);
            });
    });

    it('users should input a rating between 0 and 10', function (done) {
        request(app)
            .post('/rate')
            .send({
                firstName: 'Alice',
                lastName: 'Johnson',
                rating: 15,
                comment: 'Could be better'
            })
            .expect(400) // Expect a bad request due to invalid rating value
            .expect(res => {
                assert.include(res.text, 'Please enter a rating between 0 and 10', 'Should display invalid rating message');
            })
            .end(done);
    });

    it('the average rating should not be calculated for invalid ratings', function (done) {
        request(app)
            .post('/rate')
            .send({
                firstName: 'Bob',
                lastName: 'Smith',
                rating: -2,
                comment: 'Needs improvement'
            })
            .expect(400) // Expect a bad request due to invalid rating value
            .end(function () {
                // Get reports to check if the invalid rating is not included in the average calculation
                request(app)
                    .get('/reports')
                    .expect(200)
                    .expect(res => {
                        const bob = res.text.includes('Bob Smith - Comments');
                        assert.isFalse(bob, 'Bob Smith should not have an average rating');
                    })
                    .end(done);
            });
    });

    it('the back to home button returns you to the home page', function (done) {
        request(app)
            .get('/reports')
            .expect(200) // Expect the reports page
            .end(function (err, res) {
                if (err) return done(err);

                const homeLink = '<a href="/" class="route-btn">Back to Home</a>';
                assert.include(res.text, homeLink, 'Reports page should have a link back to home');

                // Click on the link to go back to home page
                request(app)
                    .get('/')
                    .expect(200) // Expect the home page
                    .end(done);
            });
    });

    it('nonexistent route should return a 404 page', function (done) {
        request(app)
            .get('/nonexistent')
            .expect(404) // Expect a not found page
            .end(done);
    });

});
